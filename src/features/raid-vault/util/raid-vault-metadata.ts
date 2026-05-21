import type { RaidInventoryItem } from '@/features/raid-vault/data-access/raid-vault-catalog'
import type { RaidScore, RaidVaultMetadata } from '@/features/raid-vault/util/raid-vault-types'

export async function createKitHash(owner: string, runId: string, selectedItems: RaidInventoryItem[]) {
  const payload = JSON.stringify({
    items: selectedItems.map((item) => item.id).sort(),
    owner,
    runId,
  })
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function createMetadataUri(metadata: RaidVaultMetadata) {
  return `data:application/json;utf8,${encodeURIComponent(JSON.stringify(metadata))}`
}

export function createRaidMetadata({
  artUri,
  kitHash,
  owner,
  runId,
  score,
  selectedItems,
}: {
  artUri: string
  kitHash: string
  owner: string
  runId: string
  score: RaidScore
  selectedItems: RaidInventoryItem[]
}): RaidVaultMetadata {
  return {
    attributes: [
      { trait_type: 'Build', value: '091' },
      { trait_type: 'Run ID', value: runId },
      { trait_type: 'Readiness', value: score.readiness },
      { trait_type: 'Access Tier', value: score.accessTier },
      { trait_type: 'Kit Power', value: score.kitPower },
      { trait_type: 'Run Risk', value: score.runRisk },
      ...selectedItems.map((item) => ({ trait_type: `Slot ${item.slot}`, value: item.name })),
    ],
    description:
      'Wallet-signed MPL Core devnet Raid Vault Key proving ownership, access, and provenance for a locked RaidVault kit.',
    external_url: 'https://raidvault091.colmena.dev',
    image: artUri,
    name: `Raid Vault Key ${runId}`,
    properties: {
      category: 'game-vault-access',
      files: [{ type: 'image/svg+xml', uri: artUri }],
      kit_hash: kitHash,
      owner,
      run_id: runId,
    },
  }
}

export function createRunId(owner: string, selectedItems: RaidInventoryItem[]) {
  const suffix = selectedItems.map((item) => item.id.slice(0, 3)).join('-')
  return `rv091-${owner.slice(0, 4)}-${Date.now().toString(36)}-${suffix}`
}

export function createVaultArtUri({
  kitHash,
  score,
  selectedItems,
}: {
  kitHash: string
  score: RaidScore
  selectedItems: RaidInventoryItem[]
}) {
  const bands = selectedItems
    .map((item, index) => {
      const hue = (item.power * 3 + item.scarcity * 5 + index * 47) % 360
      const x = 44 + index * 96
      return `<rect x="${x}" y="72" width="62" height="196" rx="10" fill="hsl(${hue} 78% 52%)" opacity=".78"/><text x="${x + 31}" y="296" fill="#d8fff2" font-size="11" text-anchor="middle">${item.slot}</text>`
    })
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#06080d"/><rect x="22" y="22" width="596" height="316" rx="18" fill="#0f1720" stroke="#2dd4bf" stroke-opacity=".45"/><path d="M0 318 C112 245 206 388 331 294 C454 203 532 286 640 210 L640 360 L0 360Z" fill="#11312e"/><text x="42" y="58" fill="#f7fee7" font-family="monospace" font-size="22">RaidVault 091</text><text x="42" y="326" fill="#99f6e4" font-family="monospace" font-size="13">KIT ${kitHash.slice(0, 18)} | READINESS ${score.readiness} | ${score.accessTier}</text>${bands}<circle cx="548" cy="94" r="${32 + Math.round(score.lootPotential / 5)}" fill="none" stroke="#facc15" stroke-width="6" opacity=".82"/><circle cx="548" cy="94" r="18" fill="#facc15" opacity=".42"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
