# RaidVault

RaidVault is Nightshift build 091: a dark-mode Solana game inventory and vault app for assembling a raid kit, locking it into a vault run, generating game-ready metadata/art, and minting a wallet-signed MPL Core devnet **Raid Vault Key**.

Live URL: https://raidvault091.colmena.dev  
Repository: https://github.com/obrera/nightshift-091-raidvault

## Product

Players choose one item for each raid slot: weapon, armor, tool, relic, and supply. The app calculates readiness, risk, loot potential, and access tier, then creates a metadata preview with generated SVG key art. When the connected wallet commits the kit, the client builds an MPL Core `createV1` transaction with `@obrera/mpl-core-kit-lib` and signs/sends it through `@wallet-ui/react`.

The NFT does product work: it is the access and provenance key for a locked raid kit. Ownership of the key proves which wallet committed the exact kit hash, run ID, generated metadata, and devnet asset.

## Wallet-Signed Mint Architecture

- The app uses `@wallet-ui/react` for wallet connection and transaction signing.
- Minting is client-side and wallet-signed. There is no server mint path.
- The connected wallet is the payer, owner, and update authority for the MPL Core asset.
- A generated asset keypair signs as the new MPL Core asset account.
- The on-chain URI is a short first-party `/metadata/<run>.json` URL so the Solana message stays under the raw 1232-byte limit. The Bun server serves matching JSON and SVG art routes.
- The app does not import `@solana/web3.js`, `@solana/wallet-adapter-react`, or wallet-standard packages directly.

Latest devnet proof:

- Asset: `8uULYg182MynzYTbJa5ZzphW3oXQFcKZCsAATVsgfuAY`
- Tx: `DqKFw7wWkbmVMCz9YrxEbNKmpizSzx6vEJXhTVEwNDnBCLZWW9ryWjLE6d7Bv95y6r9RCmTTzXLnsTowMvE5iWU`
- Message size: `527` bytes

## Run Locally

```bash
bun install
bun run dev
```

Open `http://localhost:5173`.

## Commands

```bash
bun run build
bun run lint
bun run check-types
bun run ci
bun run proof:mint
```

## Challenge Reference

- Build: 091
- App: RaidVault
- Date: 2026-05-21 UTC
- Intended deployment: https://raidvault091.colmena.dev
- Scaffold: `bun x create-seed@latest raidvault091-seed -t bun-react-vite-solana-kit --pm bun --skip-git`
- Model/agent: Codex GPT-5 coding agent

## Implementation Notes

The app follows `src/features/raid-vault/{data-access,feature,ui,util}` with thin router entrypoints. It was scaffolded from live create-seed. The initial temp scaffold dependency install failed because `--skip-git` caused the template `lefthook install` prepare step to run outside a Git repo; dependencies installed cleanly after copying the scaffold into this repository Git root.

The production container runs `server.ts` with Bun. The server only serves static assets, health checks, and first-party metadata/art routes; it does not mint or sign transactions.
