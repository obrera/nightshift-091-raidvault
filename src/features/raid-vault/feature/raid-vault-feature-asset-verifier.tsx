import { useState } from 'react'

import type { RaidReceipt } from '@/features/raid-vault/util/raid-vault-types'
import type { SolanaClient } from '@/solana/data-access/solana-client'

import { useRaidVaultAssetProofQuery } from '@/features/raid-vault/data-access/use-raid-vault-asset-proof-query'
import { RaidVaultUiChainVerifier } from '@/features/raid-vault/ui/raid-vault-ui-chain-verifier'

export function RaidVaultFeatureAssetVerifier({
  client,
  connectedOwner,
  receipts,
}: {
  client: SolanaClient
  connectedOwner?: string
  receipts: RaidReceipt[]
}) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const proofQuery = useRaidVaultAssetProofQuery({ client, query })

  function selectReceipt(receipt: RaidReceipt) {
    setInput(receipt.assetAddress)
    setQuery(receipt.assetAddress)
  }

  function verifyInput() {
    setQuery(input.trim())
  }

  return (
    <RaidVaultUiChainVerifier
      connectedOwner={connectedOwner}
      errorMessage={proofQuery.error instanceof Error ? proofQuery.error.message : undefined}
      input={input}
      isError={proofQuery.isError}
      isFetching={proofQuery.isFetching}
      proof={proofQuery.data}
      receipts={receipts}
      selectReceipt={selectReceipt}
      setInput={setInput}
      verifyInput={verifyInput}
    />
  )
}
