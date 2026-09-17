# Security App

React Native application for estate security guards. A single device
authenticates with a code an admin generates, then verifies and approves/
declines visitor access codes at the gate.

- **Path:** `indwella-security-app/`
- **Stack:** React Native 0.79, React 19, React Navigation 7, TypeScript,
  `@indwella/sdk` — an essentially identical scaffold to the resident app
  (same `package.json` dependency list, same folder skeleton, same Android
  package name — see `../ENGINEERING-HANDOFF.md`), with a much smaller
  feature set built on top of it.
- **Role served:** `security` only (see `../USER-ROLES.md`)

## Where to look for what

| Doc | Covers |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Folder structure, how it differs from the resident app |
| [`FEATURES.md`](./FEATURES.md) | The three real screens, traced UI → SDK → API |
| [`API-USAGE.md`](./API-USAGE.md) | Call-site map |
| [`AUTHENTICATION.md`](./AUTHENTICATION.md) | Device-code login specifics |
| [`NAVIGATION.md`](./NAVIGATION.md) | Full route tree (short) |
| [`STATE-MANAGEMENT.md`](./STATE-MANAGEMENT.md) | AuthContext + local state, no store |
| [`HANDOFF.md`](./HANDOFF.md) | App-specific bugs and next steps |

## Quick start

```bash
cd indwella-sdk && yarn install && yarn build
cd ../indwella-security-app
yarn install
cp .env.example .env      # set API_BASE_URL
yarn start
yarn android                # or: yarn ios
```

`yarn test` runs one Jest smoke test — same caveat as the resident app.

## Scope, at a glance

This app does exactly one job: turn a visitor access code into an
approve/decline decision, plus record a departure. It has no visibility into
residents, wallets, estate administration, or billing — see `../USER-ROLES.md`
for the full permission boundary. It also has no notifications inbox
(explicitly stubbed as unavailable in the shared `Navbar` component) and does
not use the SDK's `searchVisitor` endpoint despite offering a search box —
its history search is entirely client-side filtering. See
`../FEATURE-MATRIX.md`.
