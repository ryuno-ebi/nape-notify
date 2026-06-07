import { app, Menu, Tray } from 'electron'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { FallbackProvider } from './providers/fallback-provider.js'
import { ChromeKeychronLauncherDomProvider } from './providers/keychron-launcher/chrome-keychron-launcher-dom-provider.js'
import { MockProvider } from './providers/mock-provider.js'
import { OverlayWindow } from './overlay-window.js'
import { createNumberIcon, updateTrayIcon } from './presenters/tray-icon.js'
import { getLogPath, log } from './logger.js'
import type { DeviceState, StateProvider } from '../shared/device-state.js'

let tray: Tray | undefined
let lastState: DeviceState | undefined
let overlayConfig: OverlayConfig = {}

const overlay = new OverlayWindow()
const provider: StateProvider = new FallbackProvider(
  new ChromeKeychronLauncherDomProvider(),
  new MockProvider()
)

async function bootstrap(): Promise<void> {
  log('bootstrap:start', { packaged: app.isPackaged, version: app.getVersion() })
  overlayConfig = readOverlayConfig()
  app.setName('Nape Notify')
  tray = new Tray(createNumberIcon('-', false))
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Test notification',
      click: () => {
        void overlay.show({
          title: 'Layer Test',
          subtitle: 'Angle 225 deg',
          layer: lastState?.layer ?? 0,
          angle: lastState?.angle,
          ...overlayConfig,
          durationMs: 1500
        })
      }
    },
    {
      label: 'Provider status',
      click: () => {
        const status = provider.getStatus()
        void overlay.show({
          title: status.connected ? 'Provider connected' : 'Provider waiting',
          subtitle: status.message ?? status.lastError,
          durationMs: 2200
        })
        log('menu:provider-status', status)
      }
    },
    {
      label: 'Log path',
      click: () => log('menu:log-path', getLogPath())
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]))
  updateTrayIcon(tray, undefined)

  provider.onState((state) => {
    const changed = lastState?.layer !== state.layer || lastState?.angle !== state.angle
    lastState = state
    log('provider:state', state)
    if (tray) updateTrayIcon(tray, state)
    if (changed) {
      void overlay.show({
        title: `Layer ${state.layer ?? '-'}`,
        subtitle: state.angle === undefined ? undefined : `Angle ${state.angle} deg`,
        layer: state.layer,
        angle: state.angle,
        ...overlayConfig,
        durationMs: 1500
      })
    }
  })

  await provider.start()
  log('provider:started', provider.getStatus())
}

app.whenReady().then(() => {
  void bootstrap()
}).catch((error: unknown) => {
  log('bootstrap:error', String(error))
  throw error
})

app.on('window-all-closed', () => {})

app.on('before-quit', () => {
  log('app:before-quit')
  void provider.stop()
})

type OverlayConfig = {
  deviceImageUrl?: string
  deviceImageBaseAngle?: number
}

function readOverlayConfig(): OverlayConfig {
  const configPath = join(app.getPath('userData'), 'config.json')
  try {
    if (!existsSync(configPath)) {
      log('config:not-found', { configPath })
      return {}
    }
    const config = JSON.parse(readFileSync(configPath, 'utf8')) as {
      deviceImagePath?: unknown
      deviceImageBaseAngle?: unknown
    }
    const result: OverlayConfig = {}
    if (typeof config.deviceImagePath === 'string' && config.deviceImagePath.trim()) {
      result.deviceImageUrl = pathToFileURL(config.deviceImagePath).toString()
    }
    if (typeof config.deviceImageBaseAngle === 'number' && Number.isFinite(config.deviceImageBaseAngle)) {
      result.deviceImageBaseAngle = config.deviceImageBaseAngle
    }
    log('config:loaded', { configPath, hasDeviceImage: Boolean(result.deviceImageUrl), deviceImageBaseAngle: result.deviceImageBaseAngle })
    return result
  } catch (error) {
    log('config:error', { configPath, error: error instanceof Error ? error.message : String(error) })
    return {}
  }
}
