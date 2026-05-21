import type { RaidInventoryItem, RaidItemSlot } from './src/features/raid-vault/data-access/raid-vault-catalog'
import type { RaidKit, RaidScore } from './src/features/raid-vault/util/raid-vault-types'

import { RAID_INVENTORY, RAID_SLOTS } from './src/features/raid-vault/data-access/raid-vault-catalog'
import { createRaidMetadata, createVaultArtUri } from './src/features/raid-vault/util/raid-vault-metadata'

const port = Number(process.env.PORT ?? 3000)
const distRoot = new URL('./dist/', import.meta.url)

function calculateRaidScore(kit: RaidKit): RaidScore {
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

function clamp(value: number) {
  return Math.max(0, Math.min(99, value))
}

function findSelectedItem(slot: RaidItemSlot, itemIds: string[]) {
  return RAID_INVENTORY.find((item) => item.slot === slot && itemIds.includes(item.id))
}

function getSelectedItems(kit: RaidKit) {
  return RAID_SLOTS.map((slot) => kit[slot]).filter((item): item is RaidInventoryItem => Boolean(item))
}

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, {
    headers: { 'cache-control': 'no-store', ...init?.headers },
    status: init?.status,
  })
}

function parseMetadataRequest(url: URL, runId: string) {
  const itemIds = (url.searchParams.get('items') ?? '').split(',').filter(Boolean)
  const kitHash = url.searchParams.get('kit')
  const owner = url.searchParams.get('owner')

  if (!kitHash || !owner || itemIds.length !== RAID_SLOTS.length) {
    return null
  }

  const selectedItems = RAID_SLOTS.map((slot) => findSelectedItem(slot, itemIds))

  if (selectedItems.some((item) => !item)) {
    return null
  }

  const kit = Object.fromEntries(
    selectedItems.filter((item): item is RaidInventoryItem => Boolean(item)).map((item) => [item.slot, item]),
  ) as RaidKit

  return {
    kitHash,
    owner,
    runId,
    score: calculateRaidScore(kit),
    selectedItems: getSelectedItems(kit),
  }
}

function publicOrigin(request: Request) {
  const url = new URL(request.url)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const host = forwardedHost ?? request.headers.get('host') ?? url.host
  const protocol = forwardedProto ?? url.protocol.replace(/:$/, '')

  return `${protocol}://${host}`
}

async function serveStatic(pathname: string) {
  if (pathname.includes('..')) {
    return new Response('Bad request', { status: 400 })
  }

  const filePath = pathname === '/' ? 'index.html' : pathname.slice(1)
  const file = Bun.file(new URL(filePath, distRoot))

  if (await file.exists()) {
    return new Response(file)
  }

  return new Response(Bun.file(new URL('index.html', distRoot)))
}

Bun.serve({
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return json({ ok: true, project: 'RaidVault 091' })
    }

    const metadataMatch = url.pathname.match(/^\/metadata\/(.+)\.json$/)
    if (metadataMatch?.[1]) {
      const runId = decodeURIComponent(metadataMatch[1])
      const params = parseMetadataRequest(url, runId)

      if (!params) {
        return json({ error: 'invalid_metadata_request' }, { status: 400 })
      }

      const metadataQuery = url.searchParams.toString()
      const artUri = `${publicOrigin(request)}/metadata/${encodeURIComponent(runId)}.svg?${metadataQuery}`

      return json(createRaidMetadata({ ...params, artUri }))
    }

    const imageMatch = url.pathname.match(/^\/metadata\/(.+)\.svg$/)
    if (imageMatch?.[1]) {
      const runId = decodeURIComponent(imageMatch[1])
      const params = parseMetadataRequest(url, runId)

      if (!params) {
        return new Response('Invalid metadata request', { status: 400 })
      }

      const artUri = createVaultArtUri(params)
      const svg = decodeURIComponent(artUri.replace(/^data:image\/svg\+xml;utf8,/, ''))

      return new Response(svg, {
        headers: { 'cache-control': 'public, max-age=300', 'content-type': 'image/svg+xml; charset=utf-8' },
      })
    }

    return serveStatic(url.pathname)
  },
  port,
})

console.log(`RaidVault 091 server listening on ${port}`)
