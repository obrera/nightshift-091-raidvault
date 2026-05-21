import type { RaidInventoryItem } from '@/features/raid-vault/data-access/raid-vault-catalog'
import type { RaidScore } from '@/features/raid-vault/util/raid-vault-types'

import { createRaidMetadata, createVaultArtUri } from '@/features/raid-vault/util/raid-vault-metadata'

export function RaidVaultUiMetadata({
  kitHash,
  owner,
  runId,
  score,
  selectedItems,
}: {
  kitHash: string
  owner: string
  runId: string
  score: RaidScore
  selectedItems: RaidInventoryItem[]
}) {
  const artUri = createVaultArtUri({ kitHash, score, selectedItems })
  const metadata = createRaidMetadata({ artUri, kitHash, owner, runId, score, selectedItems })

  return (
    <section className="rounded-md border border-border/70 bg-card/70 p-4">
      <h2 className="text-lg font-semibold">Game-ready metadata</h2>
      <div className="mt-4 overflow-hidden rounded-md border border-border/70 bg-background">
        <img alt="Generated RaidVault key art" className="aspect-video w-full object-cover" src={artUri} />
      </div>
      <pre className="mt-4 max-h-72 overflow-auto rounded-md border border-border/70 bg-background/70 p-3 text-[0.68rem] leading-5 text-muted-foreground">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </section>
  )
}
