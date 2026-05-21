import {
  createSolanaDevnet,
  createSolanaLocalnet,
  createSolanaTestnet,
  createStorage,
  createWalletUiConfig,
  WalletUi,
} from '@wallet-ui/react'
import { type ReactNode } from 'react'

function createStableStorage<T>(key: string, initial: T) {
  const storage = createStorage({ initial, key })
  const value = storage.value

  Object.defineProperty(storage, 'value', {
    get: () => value,
  })

  return storage
}

const config = createWalletUiConfig({
  accountStorage: createStableStorage<string | undefined>('wallet-ui:account', undefined),
  clusters: [
    createSolanaDevnet('https://api.devnet.solana.com'),
    createSolanaLocalnet('http://127.0.0.1:8899'),
    createSolanaTestnet('https://api.testnet.solana.com'),
  ],
  clusterStorage: createStableStorage('wallet-ui:cluster', 'solana:devnet'),
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  return <WalletUi config={config}>{children}</WalletUi>
}
