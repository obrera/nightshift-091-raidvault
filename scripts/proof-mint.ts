import {
  type Address,
  appendTransactionMessageInstruction,
  assertIsTransactionWithBlockhashLifetime,
  compileTransactionMessage,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getCompiledTransactionMessageEncoder,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from '@solana/kit'

import { RAID_INVENTORY } from '../src/features/raid-vault/data-access/raid-vault-catalog'
import { getRaidVaultCreateInstruction } from '../src/features/raid-vault/data-access/raid-vault-mint'
import { createKitHash, createMetadataUri, createRunId } from '../src/features/raid-vault/util/raid-vault-metadata'

const keypairPath = '/home/obrera/keys/obrE1BHvP4EX8PkxPxAJxYfQkgfgCmXyJadQA3yBb7G.json'
const rpc = createSolanaRpc('https://api.devnet.solana.com')
const rpcSubscriptions = createSolanaRpcSubscriptions('wss://api.devnet.solana.com')
const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })

function findInventoryItem(id: string) {
  const item = RAID_INVENTORY.find((candidate) => candidate.id === id)

  if (!item) {
    throw new Error(`Missing inventory item ${id}`)
  }

  return item
}

async function fundPayer(address: Address) {
  const balance = await rpc.getBalance(address, { commitment: 'confirmed' }).send()

  if (balance.value >= 50_000_000n) {
    return
  }

  await rpc.requestAirdrop(address, lamports(1_000_000_000n)).send()
  await waitForBalance(address, 50_000_000n)
}

async function loadSigner(path: string) {
  const secret = JSON.parse(await Bun.file(path).text()) as number[]

  return createKeyPairSignerFromBytes(Uint8Array.from(secret))
}

async function main() {
  const payer = await loadSigner(keypairPath)
  const asset = await generateKeyPairSigner()
  const selectedItems = [
    findInventoryItem('coil-shotgun'),
    findInventoryItem('aegis-frame'),
    findInventoryItem('echo-spike'),
    findInventoryItem('sol-cipher'),
    findInventoryItem('stasis-patch'),
  ]
  const runId = createRunId(String(payer.address), selectedItems)
  const kitHash = await createKitHash(String(payer.address), runId, selectedItems)
  const uri = createMetadataUri({
    kitHash,
    origin: 'https://raidvault091.colmena.dev',
    owner: String(payer.address),
    runId,
    selectedItems,
  })

  await fundPayer(payer.address)

  const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (transactionMessage) => setTransactionMessageFeePayerSigner(payer, transactionMessage),
    (transactionMessage) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transactionMessage),
    (transactionMessage) =>
      appendTransactionMessageInstruction(
        getRaidVaultCreateInstruction({
          asset,
          name: `Raid Vault Key ${runId}`,
          owner: payer.address,
          payer,
          uri,
        }),
        transactionMessage,
      ),
  )
  const compiledMessageBytes = getCompiledTransactionMessageEncoder().encode(compileTransactionMessage(message))
  const transaction = await signTransactionMessageWithSigners(message)

  assertIsTransactionWithBlockhashLifetime(transaction)
  await sendAndConfirmTransaction(transaction, { commitment: 'confirmed' })

  console.log(`asset=${asset.address}`)
  console.log(`tx=${getSignatureFromTransaction(transaction)}`)
  console.log(`uri=${uri}`)
  console.log(`messageBytes=${compiledMessageBytes.length}`)
  console.log(`explorer=https://explorer.solana.com/address/${asset.address}?cluster=devnet`)
}

async function waitForBalance(address: Address, minimumLamports: bigint) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1_500))
    const balance = await rpc.getBalance(address, { commitment: 'confirmed' }).send()

    if (balance.value >= minimumLamports) {
      return
    }
  }
}

await main()
