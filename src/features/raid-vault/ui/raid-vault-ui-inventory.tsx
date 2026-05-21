import { Check, PackagePlus } from 'lucide-react'

import type { RaidInventoryItem, RaidItemSlot } from '@/features/raid-vault/data-access/raid-vault-catalog'
import type { RaidKit } from '@/features/raid-vault/util/raid-vault-types'

import { Badge } from '@/core/ui/badge'
import { formatSlot } from '@/features/raid-vault/util/raid-vault-calculations'

export function RaidVaultUiInventory({
  inventory,
  kit,
  selectItem,
}: {
  inventory: RaidInventoryItem[]
  kit: RaidKit
  selectItem: (item: RaidInventoryItem) => void
}) {
  const grouped = inventory.reduce(
    (result, item) => ({
      ...result,
      [item.slot]: [...(result[item.slot] ?? []), item],
    }),
    {} as Partial<Record<RaidItemSlot, RaidInventoryItem[]>>,
  )

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-normal">Armory inventory</h2>
        <p className="text-sm text-muted-foreground">Choose one item per raid slot to lock into the vault run.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Object.entries(grouped).map(([slot, items]) => (
          <div className="rounded-md border border-border/70 bg-card/60 p-3" key={slot}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{formatSlot(slot)}</h3>
              {kit[slot as RaidItemSlot] ? (
                <Badge variant="secondary">Loaded</Badge>
              ) : (
                <Badge variant="outline">Empty</Badge>
              )}
            </div>
            <div className="space-y-2">
              {items.map((item) => {
                const selected = kit[item.slot]?.id === item.id
                return (
                  <button
                    className="grid w-full grid-cols-[1fr_auto] gap-3 rounded-md border border-border/70 bg-background/45 p-3 text-left transition hover:border-primary/70 hover:bg-primary/5"
                    key={item.id}
                    onClick={() => selectItem(item)}
                    type="button"
                  >
                    <span className="min-w-0 space-y-2">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant="outline">{item.className}</Badge>
                      </span>
                      <span className="block text-xs leading-5 text-muted-foreground">{item.note}</span>
                      <span className="grid grid-cols-4 gap-2 text-[0.68rem] text-muted-foreground">
                        <span>POW {item.power}</span>
                        <span>STB {item.stability}</span>
                        <span>RAR {item.scarcity}</span>
                        <span>RSK {item.risk}</span>
                      </span>
                    </span>
                    <span
                      aria-label={`Select ${item.name}`}
                      className={`inline-flex size-8 items-center justify-center rounded-md ${
                        selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {selected ? <Check className="size-4" /> : <PackagePlus className="size-4" />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
