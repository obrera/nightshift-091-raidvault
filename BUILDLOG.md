# RaidVault Build Log

## Metadata

- Build: 091
- App: RaidVault
- Repo: `obrera/nightshift-091-raidvault`
- Intended live URL: https://raidvault091.colmena.dev
- Date: 2026-05-21 UTC
- Agent/model: Codex GPT-5 coding agent
- Started: 2026-05-21T01:03:00Z
- Last local verification: 2026-05-21T07:54:00Z

## NFT Use Case

- Family: game access, provenance, and ownership receipt
- Primary actor: Solana game player assembling a raid kit
- Why NFT ownership matters: the MPL Core asset is the portable Raid Vault Key for a committed kit. It binds owner wallet, run ID, item loadout, kit hash, readiness score, generated metadata, and art into a wallet-owned object that can be used for access checks or provenance review.
- Mint/claim confirmation: minting is client-side and wallet-signed through `@wallet-ui/react`; no server mint path exists.

## Scorecard

- Live create-seed scaffold: complete
- TypeScript + Bun + Vite + React + Tailwind: complete
- Dark-mode UI: complete
- Feature structure under `src/features/raid-vault`: complete
- `@wallet-ui/react` wallet connection: complete
- `@obrera/mpl-core-kit-lib` npm dependency: complete
- No direct app import of `@solana/web3.js`, wallet-adapter-react, or wallet-standard packages: complete
- No Node Buffer in app code: complete
- Product-critical wallet mint/commit flow: complete
- Short on-chain metadata URI with first-party JSON/SVG routes: complete
- User capabilities: inventory assembly, readiness scoring, generated metadata/art preview, wallet-signed MPL Core mint, local receipt history, on-chain Core verifier
- Local build: passing
- Devnet proof mint: passing

## Log

- 2026-05-21T01:03:00Z: Confirmed empty repo and Bun availability.
- 2026-05-21T01:04:00Z: Ran live create-seed with `bun-react-vite-solana-kit`. Template cloned and configured. Dependency install failed in temp dir because `--skip-git` left no Git repo for `lefthook install`.
- 2026-05-21T01:05:00Z: Copied scaffold into project Git root and ran `bun install` successfully.
- 2026-05-21T01:06:00Z: Added `@obrera/mpl-core-kit-lib` from npm.
- 2026-05-21T01:07:00Z: Built RaidVault feature structure, inventory data, scoring, metadata generation, receipt storage, verifier, and wallet-signed MPL Core mint hook.
- 2026-05-21T01:09:00Z: Removed template direct mobile wallet-standard adapter import/dependency so app wallet access stays through `@wallet-ui/react`.
- 2026-05-21T01:10:54Z: `bun run build` passed.
- 2026-05-21T01:14:09Z: Created Dokploy project/compose/domain for `raidvault091.colmena.dev`; adjusted Nginx container to listen on Dokploy's selected internal port 3000.
- 2026-05-21T07:32:00Z: Bee caught live wallet error `-32602`; decoded as `VersionedMessage too large: 12572 bytes (max raw 1232)`.
- 2026-05-21T07:37:00Z: Replaced full metadata/image data URI in the MPL Core create instruction with a short first-party metadata URL and added a Bun runtime server for `/metadata/*.json` and `/metadata/*.svg`.
- 2026-05-21T07:42:00Z: Verified `lint:fix`, `check-types`, `build`, Docker build, Docker health/metadata routes, and `bun run proof:mint`.
- 2026-05-21T07:54:00Z: Added an on-chain Core verifier after wallet collectible visibility failed on devnet. The verifier accepts either the transaction signature or MPL Core asset address, decodes the asset account via RPC, and checks owner/update authority without relying on wallet/indexer display.

## Devnet Proof

- Asset: `8uULYg182MynzYTbJa5ZzphW3oXQFcKZCsAATVsgfuAY`
- Tx: `DqKFw7wWkbmVMCz9YrxEbNKmpizSzx6vEJXhTVEwNDnBCLZWW9ryWjLE6d7Bv95y6r9RCmTTzXLnsTowMvE5iWU`
- URI: `https://raidvault091.colmena.dev/metadata/rv091-obrE-mpf5viex-coi-aeg-ech-sol-sta.json?items=coil-shotgun%2Caegis-frame%2Cecho-spike%2Csol-cipher%2Cstasis-patch&kit=f730f5b941196ac8ecd6d8214fdebbde95e2cce8878b89fc12c34f3261b4e9c0&owner=obrE1BHvP4EX8PkxPxAJxYfQkgfgCmXyJadQA3yBb7G`
- Compiled message size: `527` bytes

## Verifier Proof

- Asset: `BMg3DM5Fh5bUfTWPdUvgsJi5kV5SWx4gcjVU7f6JVbqE`
- Tx: `WgJ4jY3kcWhYPEWAwaraW6vRyUcXWWRLTqaLxycw8R9YJ6XxP7cvf5ArK6DRB1LZ6C9xxXq47TGjWjRaYmD48zm`
- Owner: `ALiC98dw6j47Skrxje3zBN4jTA11w67JRjQRBeZH3BRG`
- Name: `Raid Vault Key rv091-ALiC-mpf6fzkn-coi-pha-ech-oat-sta`
- Data bytes: `408`
