import { useQuery } from '@tanstack/react-query'

import type { SolanaClient } from '@/solana/data-access/solana-client'

import { resolveRaidVaultAssetProof } from '@/features/raid-vault/data-access/raid-vault-asset-proof'

export function useRaidVaultAssetProofQuery({ client, query }: { client: SolanaClient; query: string }) {
  const trimmedQuery = query.trim()

  return useQuery({
    enabled: trimmedQuery.length > 0,
    queryFn: () => resolveRaidVaultAssetProof(client, trimmedQuery),
    queryKey: ['raid-vault-asset-proof', client, trimmedQuery],
    retry: false,
  })
}
