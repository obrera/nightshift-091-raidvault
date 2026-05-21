import {
  address,
  appendTransactionMessageInstruction,
  assertIsTransactionMessageWithSingleSendingSigner,
  compileTransactionMessage,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase58Decoder,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from '@solana/kit'
import { useMutation } from '@tanstack/react-query'
import { type UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'

import type { RaidInventoryItem } from '@/features/raid-vault/data-access/raid-vault-catalog'
import type { RaidReceipt, RaidScore } from '@/features/raid-vault/util/raid-vault-types'
import type { SolanaClient } from '@/solana/data-access/solana-client'

import { getRaidVaultCreateInstruction } from '@/features/raid-vault/data-access/raid-vault-mint'
import { createKitHash, createMetadataUri, createRunId } from '@/features/raid-vault/util/raid-vault-metadata'

export function useRaidVaultMint({ account, client }: { account: UiWalletAccount; client: SolanaClient }) {
  const transactionSigner = useWalletUiSigner({ account })

  return useMutation({
    mutationFn: async ({ score, selectedItems }: { score: RaidScore; selectedItems: RaidInventoryItem[] }) => {
      const asset = await generateKeyPairSigner()
      const runId = createRunId(account.address, selectedItems)
      const kitHash = await createKitHash(account.address, runId, selectedItems)
      const metadataUri = createMetadataUri({
        kitHash,
        origin: globalThis.location?.origin ?? 'https://raidvault091.colmena.dev',
        owner: account.address,
        runId,
        selectedItems,
      })
      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
      const message = pipe(
        createTransactionMessage({ version: 0 }),
        (transactionMessage) => setTransactionMessageFeePayerSigner(transactionSigner, transactionMessage),
        (transactionMessage) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transactionMessage),
        (transactionMessage) =>
          appendTransactionMessageInstruction(
            getRaidVaultCreateInstruction({
              asset,
              name: `Raid Vault Key ${runId}`,
              owner: address(account.address),
              payer: transactionSigner,
              uri: metadataUri,
            }),
            transactionMessage,
          ),
      )

      assertIsTransactionMessageWithSingleSendingSigner(message)

      const encodedMessage = getCompiledTransactionMessageEncoder().encode(compileTransactionMessage(message))
      const [{ value: balance }, { value: fee }] = await Promise.all([
        client.rpc.getBalance(transactionSigner.address, { commitment: 'confirmed' }).send(),
        client.rpc
          .getFeeForMessage(getBase64Decoder().decode(encodedMessage) as TransactionMessageBytesBase64, {
            commitment: 'confirmed',
          })
          .send(),
      ])

      if (fee === null) {
        throw new Error('Unable to estimate devnet fee. Refresh the blockhash and try again.')
      }
      if (balance < fee) {
        throw new Error('Connected wallet needs devnet SOL for rent and transaction fees.')
      }

      const signatureBytes = await signAndSendTransactionMessageWithSigners(message)
      const signature = getBase58Decoder().decode(signatureBytes)

      if (!signature) {
        throw new Error('Wallet submitted the transaction without returning a signature.')
      }

      return {
        assetAddress: asset.address,
        createdAt: new Date().toISOString(),
        kitHash,
        metadataUri,
        owner: account.address,
        readiness: score.readiness,
        runId,
        score,
        selectedItems,
        signature,
        status: 'minted',
      } satisfies RaidReceipt
    },
  })
}
