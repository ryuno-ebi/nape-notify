# Nape Notify

Nape Notify is a lightweight Windows tray app for showing Nape Pro layer and angle changes as a small translucent overlay.

## Current status

- Windows 11 target
- Portable Electron app
- Tray icon displays the current layer
- Overlay notification displays layer and angle changes
- Keychron Launcher DOM monitoring via Chrome DevTools Protocol
- Mock provider fallback when Chrome/Keychron Launcher is unavailable

## Development

```powershell
npm install --cache .\.npm-cache
npm run typecheck
npm run verify:package
npm run dist
```

## Keychron Launcher DOM provider

See [docs/keychron-launcher-dom-provider.md](docs/keychron-launcher-dom-provider.md).
