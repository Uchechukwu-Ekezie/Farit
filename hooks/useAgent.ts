import { useCallback } from 'react'
import { useAgentStore, ChatMessage, PendingApproval } from '@/store/agentStore'
import { useWalletStore } from '@/store/walletStore'
import { supabase } from '@/services/supabase/client'
import { useWallet } from './useWallet'
import { signAndBroadcast } from '@/services/solana/transactions'
import { useSolana } from './useSolana'
import { saveMessage } from '@/services/supabase/messages'
import { explorerTxUrl } from '@/constants/rpc'

function uuid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

interface EdgeFunctionResponse {
  type: 'reply' | 'approval_required'
  text?: string
  summary?: string
  estimated_usd?: number
  action?: Record<string, unknown>
  pending_messages?: unknown[]
}

export function useAgent() {
  const { addMessage, setThinking, setPendingApproval, messages } = useAgentStore()
  const { address } = useWallet()
  const { connection } = useSolana()

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
        id:        uuid(),
        role:      'user',
        content:   text,
        createdAt: new Date(),
      }
      addMessage(userMsg)
      setThinking(true)

      try {
        const { userId } = await getAuth()

        // Build history from current messages + new user message
        const history = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ]

        const result = await callEdgeFunction(history)

        if (result.type === 'reply' && result.text) {
          const assistantMsg: ChatMessage = {
            id:        uuid(),
            role:      'assistant',
            content:   result.text,
            createdAt: new Date(),
          }
          addMessage(assistantMsg)

          // Persist both messages to Supabase (non-blocking)
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
        }
      } catch (e) {
        addMessage({
          id:        uuid(),
          role:      'assistant',
          content:   `Error: ${(e as Error).message}`,
          createdAt: new Date(),
        })
      } finally {
        setThinking(false)
      }
    },
    [address, messages, addMessage, setThinking, setPendingApproval, callEdgeFunction, getAuth]
  )

  const approve = useCallback(
    async (approval: PendingApproval) => {
      setPendingApproval(null)
      setThinking(true)

      try {
        const action = approval.action

        // If the edge function already built a serialised tx, sign it on-device
        if (action?.serialized_tx) {
          const signature = await signAndBroadcast(
            connection,
            action.serialized_tx as string
          )
          addMessage({
            id:           uuid(),
            role:         'assistant',
            content:      `✓ Transaction confirmed! [View on Solscan](${explorerTxUrl(signature)})`,
            txSignature:  signature,
            actionStatus: 'executed',
            createdAt:    new Date(),
          })
          return
        }

        // Otherwise resume the agentic loop
        const resumeMessages = [
          ...approval.pendingMessages,
          { role: 'user', content: 'User approved the action. Proceed.' },
        ]
        const result = await callEdgeFunction(resumeMessages, true)

        if (result.type === 'reply' && result.text) {
          addMessage({
            id:           uuid(),
            role:         'assistant',
            content:      result.text,
            actionStatus: 'executed',
            createdAt:    new Date(),
          })
        }
      } catch (e) {
        addMessage({
          id:        uuid(),
          role:      'assistant',
          content:   `Action failed: ${(e as Error).message}`,
          createdAt: new Date(),
        })
      } finally {
        setThinking(false)
      }
    },
    [addMessage, callEdgeFunction, connection, setPendingApproval, setThinking]
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
            id:           uuid(),
            role:         'assistant',
            content:      result.text,
            actionStatus: 'rejected',
            createdAt:    new Date(),
          })
        }
      } catch (e) {
        addMessage({
          id:        uuid(),
          role:      'assistant',
          content:   `Error: ${(e as Error).message}`,
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
