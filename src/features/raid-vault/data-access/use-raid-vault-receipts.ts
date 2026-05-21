import { useCallback, useMemo, useSyncExternalStore } from 'react'

import type { RaidReceipt } from '@/features/raid-vault/util/raid-vault-types'

const STORAGE_KEY = 'raidvault091.receipts'
const EMPTY_RECEIPTS: RaidReceipt[] = []
let cachedReceiptValue: null | string = null
let cachedReceipts: RaidReceipt[] = EMPTY_RECEIPTS

export function useRaidVaultReceipts() {
  const receipts = useSyncExternalStore(subscribe, readReceipts, () => [])

  const addReceipt = useCallback((receipt: RaidReceipt) => {
    const nextReceipts = [receipt, ...readReceipts().filter((candidate) => candidate.runId !== receipt.runId)]
    writeReceipts(nextReceipts)
  }, [])

  const clearReceipts = useCallback(() => writeReceipts([]), [])

  return useMemo(() => ({ addReceipt, clearReceipts, receipts }), [addReceipt, clearReceipts, receipts])
}

function readReceipts(): RaidReceipt[] {
  if (typeof window === 'undefined') {
    return EMPTY_RECEIPTS
  }
  const value = window.localStorage.getItem(STORAGE_KEY)
  if (!value) {
    cachedReceiptValue = null
    cachedReceipts = EMPTY_RECEIPTS
    return cachedReceipts
  }
  if (value === cachedReceiptValue) {
    return cachedReceipts
  }
  try {
    cachedReceiptValue = value
    cachedReceipts = JSON.parse(value) as RaidReceipt[]
    return cachedReceipts
  } catch {
    cachedReceiptValue = value
    cachedReceipts = EMPTY_RECEIPTS
    return cachedReceipts
  }
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('raidvault091-receipts', onStoreChange)
  window.addEventListener('storage', onStoreChange)
  return () => {
    window.removeEventListener('raidvault091-receipts', onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

function writeReceipts(receipts: RaidReceipt[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts.slice(0, 12)))
  window.dispatchEvent(new Event('raidvault091-receipts'))
}
