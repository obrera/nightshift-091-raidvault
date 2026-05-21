import { ExternalLink, RefreshCw, SearchCheck, ShieldCheck, TriangleAlert } from 'lucide-react'

import type { RaidVaultAssetProof } from '@/features/raid-vault/data-access/raid-vault-asset-proof'
import type { RaidReceipt } from '@/features/raid-vault/util/raid-vault-types'

import { Badge } from '@/core/ui/badge'
import { Button } from '@/core/ui/button'
import { Input } from '@/core/ui/input'

export function RaidVaultUiChainVerifier({
  connectedOwner,
  errorMessage,
  input,
  isError,
  isFetching,
  proof,
  receipts,
  selectReceipt,
  setInput,
  verifyInput,
}: {
  connectedOwner?: string
  errorMessage?: string
  input: string
  isError: boolean
  isFetching: boolean
  proof?: RaidVaultAssetProof
  receipts: RaidReceipt[]
  selectReceipt: (receipt: RaidReceipt) => void
  setInput: (value: string) => void
  verifyInput: () => void
}) {
  const connectedOwnerMatches = Boolean(connectedOwner && proof?.owner === connectedOwner)

  return (
    <section className="rounded-md border border-border/70 bg-card/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">On-chain Core verifier</h2>
          <p className="text-sm text-muted-foreground">Paste a RaidVault tx or MPL Core asset address.</p>
        </div>
        <Badge variant={proof ? 'default' : 'outline'}>{proof ? 'Core proof' : 'Devnet'}</Badge>
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          className="font-mono text-xs"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              verifyInput()
            }
          }}
          placeholder="tx signature or asset address"
          value={input}
        />
        <Button disabled={!input.trim() || isFetching} onClick={verifyInput} size="icon" variant="secondary">
          {isFetching ? <RefreshCw className="animate-spin" /> : <SearchCheck />}
        </Button>
      </div>

      {receipts.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {receipts.slice(0, 3).map((receipt) => (
            <Button key={receipt.assetAddress} onClick={() => selectReceipt(receipt)} size="sm" variant="outline">
              {receipt.runId.slice(0, 18)}
            </Button>
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="mt-4 flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{errorMessage ?? 'Unable to verify this asset on devnet.'}</span>
        </div>
      ) : null}

      {proof ? (
        <div className="mt-4 space-y-3 rounded-md border border-teal-400/25 bg-background/45 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              <ShieldCheck />
              MPL Core asset found
            </Badge>
            {connectedOwner ? (
              <Badge variant={connectedOwnerMatches ? 'secondary' : 'destructive'}>
                {connectedOwnerMatches ? 'Owned by connected wallet' : 'Different owner'}
              </Badge>
            ) : null}
          </div>
          <div>
            <div className="text-sm font-medium">{proof.name}</div>
            <div className="mt-1 font-mono text-xs break-all text-muted-foreground">Asset {proof.assetAddress}</div>
            <div className="mt-1 font-mono text-xs break-all text-muted-foreground">Owner {proof.owner}</div>
            <div className="mt-1 font-mono text-xs break-all text-muted-foreground">
              Update authority {proof.updateAuthority ?? 'none'}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {proof.dataBytes} bytes | rent {proof.lamports} lamports | source {proof.source}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              href={proof.explorerUrl}
              rel="noreferrer"
              target="_blank"
            >
              Asset explorer <ExternalLink className="size-3" />
            </a>
            {proof.transactionSignature ? (
              <a
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                href={`https://explorer.solana.com/tx/${proof.transactionSignature}?cluster=devnet`}
                rel="noreferrer"
                target="_blank"
              >
                Tx explorer <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
