import type { RaidKit, RaidScore } from '@/features/raid-vault/util/raid-vault-types'

import { RAID_SLOTS, type RaidInventoryItem } from '@/features/raid-vault/data-access/raid-vault-catalog'

export function calculateRaidScore(kit: RaidKit): RaidScore {
  const selectedItems = getSelectedItems(kit)
  const completion = selectedItems.length / RAID_SLOTS.length
  const totals = selectedItems.reduce(
    (result, item) => ({
      loot: result.loot + item.scarcity,
      power: result.power + item.power,
      risk: result.risk + item.risk,
      stability: result.stability + item.stability,
    }),
    { loot: 0, power: 0, risk: 0, stability: 0 },
  )
  const divisor = Math.max(selectedItems.length, 1)
  const kitPower = Math.round(totals.power / divisor)
  const stability = Math.round(totals.stability / divisor)
  const runRisk = Math.min(99, Math.round(totals.risk / divisor + Math.max(0, selectedItems.length - 3) * 4))
  const lootPotential = Math.round(totals.loot / divisor + completion * 18)
  const readiness = clamp(
    Math.round(kitPower * 0.36 + stability * 0.34 + lootPotential * 0.18 + completion * 24 - runRisk * 0.16),
  )
  const accessTier = readiness > 83 ? 'Mythic' : readiness > 66 ? 'Striker' : 'Scout'

  return { accessTier, kitPower, lootPotential: clamp(lootPotential), readiness, runRisk, stability }
}

export function formatSlot(slot: string) {
  return slot
    .split('-')
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')
}

export function getSelectedItems(kit: RaidKit) {
  return RAID_SLOTS.map((slot) => kit[slot]).filter((item): item is RaidInventoryItem => Boolean(item))
}

export function isCompleteKit(kit: RaidKit) {
  return RAID_SLOTS.every((slot) => kit[slot])
}

function clamp(value: number) {
  return Math.max(0, Math.min(99, value))
}
