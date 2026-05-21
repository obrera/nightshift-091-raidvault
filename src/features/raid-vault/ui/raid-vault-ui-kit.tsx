import { LockKeyhole } from 'lucide-react'

import type { RaidKit } from '@/features/raid-vault/util/raid-vault-types'

import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { RAID_SLOTS } from '@/features/raid-vault/data-access/raid-vault-catalog'
import { formatSlot } from '@/features/raid-vault/util/raid-vault-calculations'

export function RaidVaultUiKit({ kit, resetKit }: { kit: RaidKit; resetKit: () => void }) {
  return (
    <section className="rounded-md border border-teal-400/20 bg-[#09110f] p-4 shadow-[0_0_36px_rgba(20,184,166,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Raid kit lockbox</h2>
          <p className="text-sm text-muted-foreground">These items become the committed provenance payload.</p>
        </div>
        <Button onClick={resetKit} size="sm" variant="outline">
          Reset
        </Button>
      </div>
      <div className="mt-4 grid gap-2">
        {RAID_SLOTS.map((slot) => {
          const item = kit[slot]
          return (
            <div
              className="grid grid-cols-[6.5rem_1fr] items-center gap-3 rounded-md border border-border/60 bg-background/35 p-3"
              key={slot}
            >
              <Badge variant={item ? 'secondary' : 'outline'}>{formatSlot(slot)}</Badge>
              {item ? (
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {item.className} | power {item.power} | stability {item.stability}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LockKeyhole className="size-4" />
                  Unassigned
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
