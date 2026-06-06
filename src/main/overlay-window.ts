import { app, BrowserWindow, screen } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { OverlayPayload } from '../shared/device-state.js'
import { log } from './logger.js'

const OVERLAY_WIDTH = 460
const OVERLAY_HEIGHT = 92
const currentDir = dirname(fileURLToPath(import.meta.url))

export class OverlayWindow {
  private window: BrowserWindow | undefined
  private destroyTimer: NodeJS.Timeout | undefined

  async show(payload: OverlayPayload): Promise<void> {
    log('overlay:show-request', payload)
    const win = await this.getWindow()
    const display = screen.getPrimaryDisplay()
    const x = Math.round(display.workArea.x + (display.workArea.width - OVERLAY_WIDTH) / 2)
    const y = display.workArea.y + 12
    win.setBounds({ x, y, width: OVERLAY_WIDTH, height: OVERLAY_HEIGHT })
    win.showInactive()
    setTimeout(() => {
      if (!win.isDestroyed()) win.webContents.send('overlay:show', payload)
    }, 50)
    log('overlay:shown')
    this.scheduleDestroy()
  }

  private async getWindow(): Promise<BrowserWindow> {
    if (this.window && !this.window.isDestroyed()) return this.window

    this.window = new BrowserWindow({
      width: OVERLAY_WIDTH,
      height: OVERLAY_HEIGHT,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      focusable: false,
      show: false,
      webPreferences: {
        preload: join(currentDir, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false
      }
    })
    this.window.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedUrl) => {
      log('overlay:did-fail-load', { errorCode, errorDescription, validatedUrl })
    })
    this.window.webContents.on('did-finish-load', () => {
      log('overlay:did-finish-load', { url: this.window?.webContents.getURL() })
    })
    this.window.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      log('overlay:console', { level, message, line, sourceId })
    })
    this.window.setIgnoreMouseEvents(true)

    const devUrl = appDevServerUrl()
    if (devUrl) {
      log('overlay:load-url', { url: `${devUrl}/overlay.html` })
      await this.window.loadURL(`${devUrl}/overlay.html`)
    } else {
      const overlayFile = join(currentDir, '../renderer/overlay.html')
      log('overlay:load-file', { overlayFile })
      await this.window.loadFile(overlayFile)
    }
    return this.window
  }

  private scheduleDestroy(): void {
    if (this.destroyTimer) clearTimeout(this.destroyTimer)
    this.destroyTimer = setTimeout(() => {
      this.window?.destroy()
      this.window = undefined
    }, 30_000)
  }
}

function appDevServerUrl(): string | undefined {
  if (process.env.VITE_DEV_SERVER_URL) return process.env.VITE_DEV_SERVER_URL
  if (app.isPackaged) return undefined
  return 'http://127.0.0.1:5173'
}
