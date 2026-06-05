# Development Environment

## Local prerequisites

- Windows 11
- Node.js 22 LTS or newer
- npm 10 or newer
- Git

Current machine check:

- Node.js: `v24.14.0`
- npm: `11.9.0`
- Git: `2.49.0.windows.1`

## Project dependencies

- `electron`: desktop runtime
- `typescript`: main/preload/renderer typing
- `vite`: lightweight renderer bundling
- `electron-builder`: portable Windows executable packaging
- `concurrently`: run Vite and Electron together during development
- `wait-on`: wait for Vite before launching Electron

`electron-builder` is configured to reuse `node_modules/electron/dist` via `electronDist`.
This avoids re-downloading the large Electron ZIP during `npm run dist`.

## Commands

```powershell
npm install
npm run dev
npm run typecheck
npm run build
npm run dist
```

`npm run dist` creates a portable Windows executable in `release/`.

## Current verification

- `npm install --cache .\.npm-cache`: passed
- `npm run typecheck`: passed
- `npm run build`: passed
- `npm run dist`: passed
- Portable output: `release/NapeNotify-0.1.0-portable.exe`

`npm audit --omit=dev` reports no runtime dependency vulnerabilities.
Plain `npm audit` currently reports Electron advisories with no available fix from npm.
The initial app keeps renderer privileges constrained with `nodeIntegration: false` and
`contextIsolation: true`.

## Resource policy

- Keep the main process, tray icon, and active provider resident.
- Create overlay/settings renderer windows only when needed.
- Use no React for the first implementation.
- Treat Keychron Launcher DOM observation as an optional provider, not a default always-on browser session.

## Keychron Launcher DOM provider

See [keychron-launcher-dom-provider.md](./keychron-launcher-dom-provider.md).
