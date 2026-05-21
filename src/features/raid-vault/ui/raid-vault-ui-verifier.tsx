import { SearchCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { RaidReceipt } from '@/features/raid-vault/util/raid-vault-types'

import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { Input } from '@/core/ui/input'

export function RaidVaultUiVerifier({ receipts }: { receipts: RaidReceipt[] }) {
  const [query, setQuery] = useState('')
  const match = useMemo(
    () =>
      receipts.find(
        (receipt) =>
          receipt.runId.toLowerCase() === query.toLowerCase() ||
          receipt.assetAddress.toLowerCase() === query.toLowerCase() ||
          receipt.kitHash.toLowerCase() === query.toLowerCase(),
      ),
    [query, receipts],
  )

  return (
    <section className="rounded-md border border-border/70 bg-card/70 p-4">
      <h2 className="text-lg font-semibold">Public receipt verifier</h2>
      <p className="text-sm text-muted-foreground">Paste a run ID, asset address, or kit hash from local receipts.</p>
      <div className="mt-4 flex gap-2">
        <Input
          onChange={(event) => setQuery(event.target.value.trim())}
          placeholder="rv091-... or asset address"
          value={query}
        />
        <Button size="icon" variant="secondary">
          <SearchCheck />
        </Button>
      </div>
      {query.length > 0 ? (
        <div className="mt-4 rounded-md border border-border/70 bg-background/45 p-3">
          {match ? (
            <div className="space-y-2 text-sm">
              <Badge>Verified local proof</Badge>
              <div className="font-mono text-xs break-all text-muted-foreground">Owner {match.owner}</div>
              <div className="font-mono text-xs break-all text-muted-foreground">Kit hash {match.kitHash}</div>
              <div className="text-xs text-muted-foreground">
                {match.selectedItems.length} locked items | readiness {match.readiness} | {match.score.accessTier}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No matching local receipt found.</div>
          )}
        </div>
      ) : null}
    </section>
  )
}
