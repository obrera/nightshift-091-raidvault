import { Activity, Gauge, Shield, Skull, Sparkles } from 'lucide-react'

import type { RaidScore } from '@/features/raid-vault/util/raid-vault-types'

import { Badge } from '@/core/ui/badge'

const stats = [
  ['Readiness', 'readiness', Gauge],
  ['Kit power', 'kitPower', Activity],
  ['Stability', 'stability', Shield],
  ['Loot', 'lootPotential', Sparkles],
  ['Risk', 'runRisk', Skull],
] as const

export function RaidVaultUiScore({ score }: { score: RaidScore }) {
  return (
    <section className="rounded-md border border-border/70 bg-card/70 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Run readiness</h2>
        <Badge>{score.accessTier}</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {stats.map(([label, key, Icon]) => (
          <div className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-2" key={key}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="size-4" />
              {label}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: `${score[key]}%` }} />
            </div>
            <div className="text-right text-xs font-medium">{score[key]}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
