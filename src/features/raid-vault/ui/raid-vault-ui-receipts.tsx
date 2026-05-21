import { ExternalLink, Trash2 } from 'lucide-react'

import type { RaidReceipt } from '@/features/raid-vault/util/raid-vault-types'

import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'

export function RaidVaultUiReceipts({
  clearReceipts,
  receipts,
}: {
  clearReceipts: () => void
  receipts: RaidReceipt[]
}) {
  return (
    <section className="rounded-md border border-border/70 bg-card/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Local receipt history</h2>
          <p className="text-sm text-muted-foreground">
            Stored in this browser for verifier lookup and raid provenance review.
          </p>
        </div>
        <Button disabled={receipts.length === 0} onClick={clearReceipts} size="icon" variant="outline">
          <Trash2 />
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {receipts.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            No vault keys minted yet.
          </div>
        ) : (
          receipts.map((receipt) => (
            <div className="rounded-md border border-border/70 bg-background/40 p-3" key={receipt.runId}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{receipt.score.accessTier}</Badge>
                <span className="font-mono text-xs">{receipt.runId}</span>
                <span className="text-xs text-muted-foreground">readiness {receipt.readiness}</span>
              </div>
              <div className="mt-2 font-mono text-xs break-all text-muted-foreground">Asset {receipt.assetAddress}</div>
              <div className="mt-1 font-mono text-xs break-all text-muted-foreground">Tx {receipt.signature}</div>
              <a
                className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                href={`https://explorer.solana.com/address/${receipt.assetAddress}?cluster=devnet`}
                rel="noreferrer"
                target="_blank"
              >
                Explorer <ExternalLink className="size-3" />
              </a>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
