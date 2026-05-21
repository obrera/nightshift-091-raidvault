import { getAssetV1AccountDataDecoder } from '@obrera/mpl-core-kit-lib/hooked'
import { address, signature } from '@solana/kit'

import type { SolanaClient } from '@/solana/data-access/solana-client'

const MPL_CORE_PROGRAM_ADDRESS = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'

export interface RaidVaultAssetProof {
  assetAddress: string
  dataBytes: number
  explorerUrl: string
  lamports: string
  name: string
  owner: string
  programOwner: string
  source: 'asset' | 'transaction'
  sourceQuery: string
  transactionSignature?: string
  updateAuthority?: string
  uri: string
}

export async function resolveRaidVaultAssetProof(client: SolanaClient, query: string): Promise<RaidVaultAssetProof> {
  const sourceQuery = query.trim()

  if (!sourceQuery) {
    throw new Error('Enter a transaction signature or MPL Core asset address.')
  }

  const directAssetAddress = parseAddress(sourceQuery)
  if (directAssetAddress) {
    return readRaidVaultAssetProof({ assetAddress: directAssetAddress, client, source: 'asset', sourceQuery })
  }

  const transactionSignature = signature(sourceQuery)
  const transaction = await client.rpc
    .getTransaction(transactionSignature, {
      commitment: 'confirmed',
      encoding: 'jsonParsed',
      maxSupportedTransactionVersion: 0,
    })
    .send()

  if (!transaction?.meta || transaction.meta.err) {
    throw new Error('Transaction was not found or did not finalize cleanly on devnet.')
  }

  const assetAddress = extractCoreAssetAddress(transaction)
  if (!assetAddress) {
    throw new Error('No MPL Core create instruction was found in this transaction.')
  }

  return readRaidVaultAssetProof({
    assetAddress,
    client,
    source: 'transaction',
    sourceQuery,
    transactionSignature: sourceQuery,
  })
}

function asRecord(value: unknown): null | Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function decodeBase64(value: string) {
  const binary = globalThis.atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function extractCoreAssetAddress(transaction: unknown) {
  const transactionObject = asRecord(transaction)
  const payload = asRecord(transactionObject?.transaction)
  const message = asRecord(payload?.message)
  const instructions = Array.isArray(message?.instructions) ? message.instructions : []

  for (const instruction of instructions) {
    const instructionObject = asRecord(instruction)
    const programAddress =
      getAddressString(instructionObject?.programId) ?? getAddressString(instructionObject?.programAddress)
    const accounts = Array.isArray(instructionObject?.accounts) ? instructionObject.accounts : []

    if (programAddress === MPL_CORE_PROGRAM_ADDRESS) {
      return getAddressString(accounts[0])
    }
  }

  return null
}

function getAddressString(value: unknown) {
  if (typeof value === 'string') {
    return value
  }
  const object = asRecord(value)
  const pubkey = object?.pubkey

  return typeof pubkey === 'string' ? pubkey : null
}

function parseAddress(value: string) {
  try {
    return String(address(value))
  } catch {
    return null
  }
}

async function readRaidVaultAssetProof({
  assetAddress,
  client,
  source,
  sourceQuery,
  transactionSignature,
}: {
  assetAddress: string
  client: SolanaClient
  source: RaidVaultAssetProof['source']
  sourceQuery: string
  transactionSignature?: string
}): Promise<RaidVaultAssetProof> {
  const assetAccount = await client.rpc
    .getAccountInfo(address(assetAddress), { commitment: 'confirmed', encoding: 'base64' })
    .send()

  if (!assetAccount.value?.data?.[0]) {
    throw new Error('MPL Core asset account was not found on devnet.')
  }

  const programOwner = String(assetAccount.value.owner)
  if (programOwner !== MPL_CORE_PROGRAM_ADDRESS) {
    throw new Error(`Account is owned by ${programOwner}, not the MPL Core program.`)
  }

  const rawBytes = decodeBase64(assetAccount.value.data[0])
  const decoded = getAssetV1AccountDataDecoder().decode(rawBytes)

  return {
    assetAddress,
    dataBytes: rawBytes.length,
    explorerUrl: `https://explorer.solana.com/address/${assetAddress}?cluster=devnet`,
    lamports: assetAccount.value.lamports.toString(),
    name: decoded.name,
    owner: String(decoded.owner),
    programOwner,
    source,
    sourceQuery,
    transactionSignature,
    updateAuthority: decoded.updateAuthority.address ? String(decoded.updateAuthority.address) : undefined,
    uri: decoded.uri,
  }
}
