import type { RaidInventoryItem, RaidItemSlot } from '@/features/raid-vault/data-access/raid-vault-catalog'

export type RaidKit = Partial<Record<RaidItemSlot, RaidInventoryItem>>

export interface RaidReceipt {
  assetAddress: string
  createdAt: string
  kitHash: string
  metadataUri: string
  owner: string
  readiness: number
  runId: string
  score: RaidScore
  selectedItems: RaidInventoryItem[]
  signature: string
  status: 'local-proof' | 'minted'
}

export interface RaidScore {
  accessTier: 'Mythic' | 'Scout' | 'Striker'
  kitPower: number
  lootPotential: number
  readiness: number
  runRisk: number
  stability: number
}

export interface RaidVaultMetadata {
  attributes: Array<{ trait_type: string; value: number | string }>
  description: string
  external_url: string
  image: string
  name: string
  properties: {
    category: string
    files: Array<{ type: string; uri: string }>
    kit_hash: string
    owner: string
    run_id: string
  }
}
