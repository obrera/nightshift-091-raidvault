import type { ReactNode } from 'react'

import { type UiWalletAccount, useWalletUi } from '@wallet-ui/react'
import { AlertCircle, CircleDollarSign, DatabaseZap, LockKeyhole, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { RaidKit } from '@/features/raid-vault/util/raid-vault-types'
import type { SolanaClient } from '@/solana/data-access/solana-client'

import { Button } from '@/core/ui/button'
import { RAID_INVENTORY } from '@/features/raid-vault/data-access/raid-vault-catalog'
import { useRaidVaultMint } from '@/features/raid-vault/data-access/use-raid-vault-mint'
import { useRaidVaultReceipts } from '@/features/raid-vault/data-access/use-raid-vault-receipts'
import { RaidVaultFeatureAssetVerifier } from '@/features/raid-vault/feature/raid-vault-feature-asset-verifier'
import { RaidVaultUiInventory } from '@/features/raid-vault/ui/raid-vault-ui-inventory'
import { RaidVaultUiKit } from '@/features/raid-vault/ui/raid-vault-ui-kit'
import { RaidVaultUiMetadata } from '@/features/raid-vault/ui/raid-vault-ui-metadata'
import { RaidVaultUiReceipts } from '@/features/raid-vault/ui/raid-vault-ui-receipts'
import { RaidVaultUiScore } from '@/features/raid-vault/ui/raid-vault-ui-score'
import { calculateRaidScore, getSelectedItems, isCompleteKit } from '@/features/raid-vault/util/raid-vault-calculations'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'
import { SolanaUiWalletDialog } from '@/solana/ui/solana-ui-wallet-dialog'

const PREVIEW_OWNER = 'connect-wallet-to-bind-owner'
const PREVIEW_RUN_ID = 'rv091-preview'
const PREVIEW_HASH = 'preview-kit-hash-locks-after-wallet-commit'

export function RaidVaultFeatureEntry() {
  const [kit, setKit] = useState<RaidKit>(() => ({
    armor: RAID_INVENTORY.find((item) => item.id === 'aegis-frame'),
    supply: RAID_INVENTORY.find((item) => item.id === 'stasis-patch'),
    tool: RAID_INVENTORY.find((item) => item.id === 'echo-spike'),
    weapon: RAID_INVENTORY.find((item) => item.id === 'coil-shotgun'),
  }))
  const { account, cluster } = useWalletUi()
  const client = useSolanaClient()
  const { addReceipt, clearReceipts, receipts } = useRaidVaultReceipts()
  const selectedItems = useMemo(() => getSelectedItems(kit), [kit])
  const score = useMemo(() => calculateRaidScore(kit), [kit])
  const complete = isCompleteKit(kit)
  const canMint = complete && Boolean(account) && cluster.id === 'solana:devnet'

  return (
    <div className="min-h-full bg-[#06080d] text-foreground">
      <section className="border-b border-teal-400/15 bg-[linear-gradient(135deg,#06110f_0%,#111827_54%,#160b14_100%)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-6 lg:px-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-teal-200 uppercase">
              <span>Nightshift build 091</span>
              <span className="text-muted-foreground">Solana devnet vault provenance</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-white md:text-5xl">RaidVault</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                Assemble a raid kit from existing game items, lock the run, generate metadata and art, then mint a
                wallet-signed MPL Core Raid Vault Key that represents access and ownership for the committed kit.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Capability icon={<DatabaseZap />} label="Inventory assembly" value={`${selectedItems.length}/5 slots`} />
              <Capability icon={<CircleDollarSign />} label="Loot access tier" value={score.accessTier} />
              <Capability icon={<WalletCards />} label="Wallet path" value={account ? 'Connected' : 'Required'} />
            </div>
          </div>
          <div className="rounded-md border border-teal-300/20 bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">Commit control</div>
                <div className="text-xs text-slate-400">Devnet, client-side, wallet-signed</div>
              </div>
              <SolanaUiWalletDialog />
            </div>
            <div className="space-y-3 rounded-md border border-border/40 bg-background/20 p-3 text-sm text-slate-300">
              <StatusLine ok={complete} text={complete ? 'Raid kit is complete' : 'Fill all five raid slots'} />
              <StatusLine
                ok={Boolean(account)}
                text={account ? `Owner ${account.address}` : 'Connect a wallet to bind ownership'}
              />
              <StatusLine ok={cluster.id === 'solana:devnet'} text={`Cluster ${cluster.id}`} />
            </div>
            {account ? (
              <ConnectedCommitButton
                account={account}
                canMint={canMint}
                client={client}
                complete={complete}
                onReceipt={addReceipt}
                score={score}
                selectedItems={selectedItems}
              />
            ) : (
              <Button className="mt-4 h-10 w-full" disabled size="lg">
                <LockKeyhole />
                Commit kit and mint key
              </Button>
            )}
            {!canMint ? (
              <div className="mt-3 flex gap-2 text-xs leading-5 text-amber-200">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                Complete the kit, connect a wallet, and select Solana Devnet before minting.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
        <RaidVaultUiInventory
          inventory={RAID_INVENTORY}
          kit={kit}
          selectItem={(item) => setKit((current) => ({ ...current, [item.slot]: item }))}
        />
        <aside className="space-y-6">
          <RaidVaultUiKit kit={kit} resetKit={() => setKit({})} />
          <RaidVaultUiScore score={score} />
          <RaidVaultUiMetadata
            kitHash={PREVIEW_HASH}
            owner={account?.address ?? PREVIEW_OWNER}
            runId={PREVIEW_RUN_ID}
            score={score}
            selectedItems={selectedItems}
          />
          <RaidVaultUiReceipts clearReceipts={clearReceipts} receipts={receipts} />
          <RaidVaultFeatureAssetVerifier client={client} connectedOwner={account?.address} receipts={receipts} />
        </aside>
      </div>
    </div>
  )
}

function Capability({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="[&_svg]:size-4">{icon}</span>
        {label}
      </div>
      <div className="mt-2 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

function ConnectedCommitButton({
  account,
  canMint,
  client,
  complete,
  onReceipt,
  score,
  selectedItems,
}: {
  account: UiWalletAccount
  canMint: boolean
  client: SolanaClient
  complete: boolean
  onReceipt: ReturnType<typeof useRaidVaultReceipts>['addReceipt']
  score: ReturnType<typeof calculateRaidScore>
  selectedItems: ReturnType<typeof getSelectedItems>
}) {
  const mintVault = useRaidVaultMint({ account, client })

  async function commitVaultRun() {
    try {
      const receipt = await mintVault.mutateAsync({ score, selectedItems })
      onReceipt(receipt)
      toast.success('Raid Vault Key minted on devnet', {
        description: `${receipt.assetAddress.slice(0, 8)}...${receipt.assetAddress.slice(-8)}`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error('Vault commit failed', { description: message })
    }
  }

  return (
    <Button
      className="mt-4 h-10 w-full"
      disabled={!canMint || !complete || mintVault.isPending}
      onClick={commitVaultRun}
      size="lg"
    >
      <LockKeyhole />
      {mintVault.isPending ? 'Minting vault key' : 'Commit kit and mint key'}
    </Button>
  )
}

function StatusLine({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1 size-2 shrink-0 rounded-full ${ok ? 'bg-primary' : 'bg-amber-300'}`} />
      <span className="break-all">{text}</span>
    </div>
  )
}

export { RaidVaultFeatureEntry as Component }
