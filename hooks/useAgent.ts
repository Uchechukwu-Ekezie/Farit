import { useCallback } from 'react'
import { useAgentStore, ChatMessage, PendingApproval } from '@/store/agentStore'
import { useWalletStore } from '@/store/walletStore'
import { supabase } from '@/services/supabase/client'
import { useWallet } from './useWallet'
import { useSolana } from './useSolana'
import { saveMessage } from '@/services/supabase/messages'
import { explorerTxUrl } from '@/constants/rpc'
import { useEmbeddedSolanaWallet } from '@privy-io/expo'
import { VersionedTransaction } from '@solana/web3.js'

function uuid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

interface EdgeFunctionResponse {
  type: 'reply' | 'approval_required' | 'tx_ready'
  text?: string
  summary?: string
  estimated_usd?: number
  action?: Record<string, unknown>
  pending_messages?: unknown[]
  tx_type?: string
  serialized_tx?: string | null
  params?: Record<string, unknown>
}

export function useAgent() {
  const { addMessage, setThinking, setPendingApproval, messages } = useAgentStore()
  const { address } = useWallet()
  const { connection } = useSolana()
  const solanaWallet = useEmbeddedSolanaWallet()

  // Sign and send any VersionedTransaction via Privy embedded wallet
  const privySignAndSend = useCallback(
    async (tx: VersionedTransaction): Promise<string> => {
      const wallet = (solanaWallet as any).wallets?.[0]
      if (!wallet) throw new Error('No Privy wallet connected')
      const provider = await wallet.getProvider()
      const { signature } = await provider.request({
        method: 'signAndSendTransaction',
        params: { transaction: tx, connection },
      })
      await connection.confirmTransaction(signature as string, 'confirmed')
      return signature as string
    },
    [solanaWallet, connection],
  )

  // Handle tx_ready — deserialize the LI.FI-built transaction and sign with Privy
  const signTxReady = useCallback(
    async (result: EdgeFunctionResponse): Promise<string> => {
      if (typeof result.serialized_tx === 'string') {
        const tx = VersionedTransaction.deserialize(Buffer.from(result.serialized_tx, 'base64'))
        try {
          return await privySignAndSend(tx)
        } catch (e) {
          const msg = (e as Error).message ?? ''
          if (msg.includes('address table') || msg.includes('prior credit')) {
            throw new Error(
              'Swap failed: switch to Mainnet in Settings → Network and fund your wallet with real SOL.'
            )
          }
          throw new Error(`Signing: ${msg}`)
        }
      }
      throw new Error('No transaction data to sign')
    },
    [privySignAndSend],
  )

  // Returns { session, userId } — throws if not authenticated
  const getAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')
    return { session, userId: session.user.id }
  }, [])

  const callEdgeFunction = useCallback(
    async (msgs: unknown[], resumeApproval = false): Promise<EdgeFunctionResponse> => {
      const { session } = await getAuth()
      const { solBalance, tokens } = useWalletStore.getState()

      const topTokenLines = [
        `SOL: ${solBalance.toFixed(4)}`,
        ...tokens.slice(0, 5).map((t) => `${t.symbol}: ${t.balance.toFixed(4)}`),
      ]
      const tokenSummary = topTokenLines.join(', ')

      const { data, error } = await supabase.functions.invoke('agent-chat', {
        body: {
          messages:        msgs,
          wallet_address:  address,
          resume_approval: resumeApproval,
          token_summary:   tokenSummary,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (error) throw error
      if (data?.error) throw new Error(data.error)
      return data as EdgeFunctionResponse
    },
    [address, getAuth]
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const currentAddress = address ?? useWalletStore.getState().address
      if (!currentAddress) {
        addMessage({
          id: uuid(), role: 'assistant',
          content: 'Wallet not connected yet. Please wait a moment and try again.',
          createdAt: new Date(),
        })
        return
      }

      const userMsg: ChatMessage = {
        id: uuid(), role: 'user', content: text, createdAt: new Date(),
      }
      addMessage(userMsg)
      setThinking(true)

      try {
        const { userId } = await getAuth()

        const history = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ]

        const result = await callEdgeFunction(history)

        if (result.type === 'reply' && result.text) {
          const assistantMsg: ChatMessage = {
            id: uuid(), role: 'assistant', content: result.text, createdAt: new Date(),
          }
          addMessage(assistantMsg)
          Promise.all([
            saveMessage(userId, userMsg),
            saveMessage(userId, assistantMsg),
          ]).catch((e) => console.warn('Message persist failed:', e))

        } else if (result.type === 'approval_required') {
          setPendingApproval({
            summary:         result.summary!,
            estimatedUsd:    result.estimated_usd!,
            action:          result.action!,
            pendingMessages: result.pending_messages!,
          })

        } else if (result.type === 'tx_ready') {
          const signature = await signTxReady(result)
          const assistantMsg: ChatMessage = {
            id: uuid(), role: 'assistant',
            content: `✓ Swap confirmed! [View on Solscan](${explorerTxUrl(signature)})`,
            txSignature: signature, actionStatus: 'executed', createdAt: new Date(),
          }
          addMessage(assistantMsg)
          Promise.all([
            saveMessage(userId, userMsg),
            saveMessage(userId, assistantMsg),
          ]).catch((e) => console.warn('Message persist failed:', e))
        }
      } catch (e) {
        addMessage({
          id: uuid(), role: 'assistant',
          content: `Error: ${(e as Error).message}`,
          createdAt: new Date(),
        })
      } finally {
        setThinking(false)
      }
    },
    [address, messages, addMessage, setThinking, setPendingApproval, callEdgeFunction, getAuth, signTxReady]
  )

  const approve = useCallback(
    async (approval: PendingApproval) => {
      setPendingApproval(null)
      setThinking(true)

      try {
        const resumeMessages = [
          ...approval.pendingMessages,
          { role: 'user', content: 'User approved the action. Proceed.' },
        ]
        const result = await callEdgeFunction(resumeMessages, true)

        if (result.type === 'reply' && result.text) {
          addMessage({
            id: uuid(), role: 'assistant', content: result.text,
            actionStatus: 'executed', createdAt: new Date(),
          })
        } else if (result.type === 'tx_ready') {
          const signature = await signTxReady(result)
          addMessage({
            id: uuid(), role: 'assistant',
            content: `✓ Transaction confirmed! [View on Solscan](${explorerTxUrl(signature)})`,
            txSignature: signature, actionStatus: 'executed', createdAt: new Date(),
          })
        }
      } catch (e) {
        addMessage({
          id: uuid(), role: 'assistant',
          content: `Action failed: ${(e as Error).message}`,
          createdAt: new Date(),
        })
      } finally {
        setThinking(false)
      }
    },
    [addMessage, callEdgeFunction, setPendingApproval, setThinking, signTxReady]
  )

  const reject = useCallback(
    async (approval: PendingApproval) => {
      setPendingApproval(null)
      setThinking(true)
      try {
        const resumeMessages = [
          ...approval.pendingMessages,
          { role: 'user', content: 'User rejected the action. Do not proceed.' },
        ]
        const result = await callEdgeFunction(resumeMessages, true)
        if (result.type === 'reply' && result.text) {
          addMessage({
            id: uuid(), role: 'assistant', content: result.text,
            actionStatus: 'rejected', createdAt: new Date(),
          })
        }
      } catch (e) {
        addMessage({
          id: uuid(), role: 'assistant',
          content: `Error: ${(e as Error).message}`,
          createdAt: new Date(),
        })
      } finally {
        setThinking(false)
      }
    },
    [addMessage, callEdgeFunction, setPendingApproval, setThinking]
  )

  return { sendMessage, approve, reject }
}
