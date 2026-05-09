export const TOOLS = [
  {
    name: 'get_balance',
    description: "Get the user's current SOL balance and SPL token balances.",
    input_schema: {
      type: 'object',
      properties: {
        wallet_address: { type: 'string', description: 'Base58 Solana wallet address' },
      },
      required: ['wallet_address'],
    },
  },
  {
    name: 'get_quote',
    description: 'Get a Jupiter swap quote. Always call this before execute_swap to show the user what they will receive.',
    input_schema: {
      type: 'object',
      properties: {
        from_mint:    { type: 'string', description: 'Input token mint address' },
        to_mint:      { type: 'string', description: 'Output token mint address' },
        amount:       { type: 'number', description: 'Amount in smallest unit (lamports or token decimals)' },
        slippage_bps: { type: 'number', description: 'Slippage tolerance in basis points, default 50' },
      },
      required: ['from_mint', 'to_mint', 'amount'],
    },
  },
  {
    name: 'execute_swap',
    description: 'Build a Jupiter swap transaction. Returns an unsigned serialized transaction for the app to sign.',
    input_schema: {
      type: 'object',
      properties: {
        from_mint:    { type: 'string' },
        to_mint:      { type: 'string' },
        amount:       { type: 'number' },
        slippage_bps: { type: 'number' },
      },
      required: ['from_mint', 'to_mint', 'amount'],
    },
  },
  {
    name: 'send_token',
    description: "Build a transaction to send SOL or an SPL token. Returns unsigned serialized tx.",
    input_schema: {
      type: 'object',
      properties: {
        token:     { type: 'string', description: "'SOL' or SPL token mint address" },
        amount:    { type: 'number' },
        recipient: { type: 'string', description: 'Recipient base58 wallet address' },
      },
      required: ['token', 'amount', 'recipient'],
    },
  },
  {
    name: 'stake_sol',
    description: 'Build a transaction to stake native SOL. Returns unsigned serialized tx.',
    input_schema: {
      type: 'object',
      properties: {
        amount_sol: { type: 'number' },
        validator:  { type: 'string', description: 'Validator vote account address (optional)' },
      },
      required: ['amount_sol'],
    },
  },
  {
    name: 'get_nfts',
    description: "Fetch the NFT portfolio for the user's wallet.",
    input_schema: {
      type: 'object',
      properties: {
        wallet_address: { type: 'string' },
      },
      required: ['wallet_address'],
    },
  },
  {
    name: 'request_approval',
    description: 'MUST be called before any action whose estimated_usd meets or exceeds the auto-approve threshold. Pauses execution and sends an approval prompt to the user.',
    input_schema: {
      type: 'object',
      properties: {
        summary:       { type: 'string', description: 'Plain English description of what will happen' },
        estimated_usd: { type: 'number', description: 'Estimated USD value of the action' },
        action:        { type: 'object', description: 'The full action payload to be executed after approval' },
      },
      required: ['summary', 'estimated_usd', 'action'],
    },
  },
]
