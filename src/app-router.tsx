import { createBrowserRouter, Navigate } from 'react-router'

import type { ShellNotFoundProps } from '@/shell/data-access/shell-not-found-props'

import { ShellFeature, ShellUiLoader } from '@/shell/feature'

export const appRouter = createBrowserRouter(
  [
    {
      children: [
        { element: <Navigate replace to="/vault" />, index: true },
        {
          lazy: () => import('@/features/raid-vault/feature/raid-vault-feature-entry'),
          path: 'vault',
        },
        {
          lazy: () => import('@/features/raid-vault/feature/raid-vault-feature-entry'),
          path: 'verify',
        },
        {
          lazy: () => import('@/shell/feature/shell-not-found-feature'),
          loader: (): ShellNotFoundProps => ({
            links: [
              {
                description: 'Open the raid inventory, scoring, metadata, and mint workspace.',
                title: 'Vault',
                to: '/vault',
              },
              {
                description: 'Verify a local RaidVault receipt by run ID, asset address, or kit hash.',
                title: 'Verifier',
                to: '/verify',
              },
            ],
          }),
          path: '*',
        },
      ],
      element: (
        <ShellFeature
          links={[
            { label: 'Vault', to: '/vault' },
            { label: 'Verifier', to: '/verify' },
          ]}
        />
      ),
      hydrateFallbackElement: <ShellUiLoader fullScreen />,
    },
  ],
  {
    // Set the base URL for router links and redirects, removing trailing slashes if present, independent of the base
    basename: import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, ''),
  },
)
