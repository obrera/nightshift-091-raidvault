import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit'

import { resolveRaidVaultAssetProof } from '../src/features/raid-vault/data-access/raid-vault-asset-proof'

const query =
  process.argv[2] ?? 'WgJ4jY3kcWhYPEWAwaraW6vRyUcXWWRLTqaLxycw8R9YJ6XxP7cvf5ArK6DRB1LZ6C9xxXq47TGjWjRaYmD48zm'

const client = {
  rpc: createSolanaRpc('https://api.devnet.solana.com'),
  rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com'),
}

const proof = await resolveRaidVaultAssetProof(client, query)

console.log(`asset=${proof.assetAddress}`)
console.log(`owner=${proof.owner}`)
console.log(`name=${proof.name}`)
console.log(`uri=${proof.uri}`)
console.log(`source=${proof.source}`)
console.log(`dataBytes=${proof.dataBytes}`)
