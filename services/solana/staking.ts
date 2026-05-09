import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  Authorized,
  Lockup,
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js'
import { DEFAULT_VALIDATOR } from '@/constants/tokens'

export async function buildStakeTransaction(
  connection: Connection,
  walletAddress: string,
  amountSol: number,
  validatorVoteAddress?: string
): Promise<string> {
  const walletPubkey  = new PublicKey(walletAddress)
  const stakeKeypair  = Keypair.generate()
  const validatorKey  = new PublicKey(validatorVoteAddress ?? DEFAULT_VALIDATOR)
  const lamports      = Math.floor(amountSol * LAMPORTS_PER_SOL)

  const createStakeIx = StakeProgram.createAccount({
    fromPubkey:   walletPubkey,
    stakePubkey:  stakeKeypair.publicKey,
    authorized:   new Authorized(walletPubkey, walletPubkey),
    lockup:       new Lockup(0, 0, walletPubkey),
    lamports,
  })

  const delegateIx = StakeProgram.delegate({
    stakePubkey:  stakeKeypair.publicKey,
    authorizedPubkey: walletPubkey,
    votePubkey:   validatorKey,
  })

  const { blockhash } = await connection.getLatestBlockhash()

  const message = new TransactionMessage({
    payerKey:    walletPubkey,
    recentBlockhash: blockhash,
    instructions: [...createStakeIx.instructions, delegateIx],
  }).compileToV0Message()

  const tx = new VersionedTransaction(message)

  return Buffer.from(tx.serialize()).toString('base64')
}
