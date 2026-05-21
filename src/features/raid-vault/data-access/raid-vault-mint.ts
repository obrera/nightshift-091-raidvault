import type { Address, TransactionSigner } from '@solana/kit'

import { getCreateV1Instruction } from '@obrera/mpl-core-kit-lib/generated'

export function getRaidVaultCreateInstruction({
  asset,
  name,
  owner,
  payer,
  uri,
}: {
  asset: TransactionSigner
  name: string
  owner?: Address
  payer: TransactionSigner
  uri: string
}) {
  return getCreateV1Instruction({
    asset,
    authority: payer,
    name,
    owner: owner ?? payer.address,
    payer,
    updateAuthority: payer.address,
    uri,
  })
}
