import type { DeviceState, ProviderStatus, StateProvider } from '../../../shared/device-state.js'
import { log } from '../../logger.js'
import { ChromeCdpClient, findLauncherTab } from './chrome-cdp-client.js'
import {
  launcherDomExpression,
  snapshotToDeviceState,
  type LauncherDomSnapshot
} from './extract-launcher-state.js'

const DEFAULT_DEBUG_PORT = 9222
const DEFAULT_POLL_INTERVAL_MS = 500

export class ChromeKeychronLauncherDomProvider implements StateProvider {
  readonly id = 'chrome-keychron-launcher-dom'
  readonly label = 'Chrome Keychron Launcher DOM'
  readonly cost = 'medium'

  private client: ChromeCdpClient | undefined
  private timer: NodeJS.Timeout | undefined
  private listeners = new Set<(state: DeviceState) => void>()
  private running = false
  private connected = false
  private lastError: string | undefined
  private lastStateKey = ''

  constructor(
    private readonly debugPort = readDebugPort(),
    private readonly pollIntervalMs = DEFAULT_POLL_INTERVAL_MS
  ) {}

  async start(): Promise<void> {
    if (this.running) return
    this.running = true
    log('chrome-dom:start', { debugPort: this.debugPort, pollIntervalMs: this.pollIntervalMs })
    await this.poll()
    this.timer = setInterval(() => {
      void this.poll()
    }, this.pollIntervalMs)
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
    this.client?.close()
    this.client = undefined
    this.running = false
    this.connected = false
    log('chrome-dom:stop')
  }

  getStatus(): ProviderStatus {
    return {
      running: this.running,
      connected: this.connected,
      message: this.connected ? 'Monitoring Keychron Launcher via Chrome CDP' : 'Waiting for Chrome CDP and Keychron Launcher tab',
      lastError: this.lastError
    }
  }

  onState(callback: (state: DeviceState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private async poll(): Promise<void> {
    try {
      if (!this.client) {
        const tab = await findLauncherTab(this.debugPort)
        if (!tab?.webSocketDebuggerUrl) {
          this.connected = false
          this.lastError = 'Keychron Launcher tab was not found via Chrome CDP'
          return
        }
        this.client = new ChromeCdpClient(tab.webSocketDebuggerUrl)
        log('chrome-dom:tab-found', { title: tab.title, url: tab.url })
      }

      const snapshot = await this.client.evaluate<LauncherDomSnapshot>(launcherDomExpression)
      const state = snapshotToDeviceState(snapshot)
      this.connected = state.connected
      this.lastError = undefined
      const key = JSON.stringify({
        connected: state.connected,
        layer: state.layer,
        angle: state.angle,
        confidence: state.confidence
      })
      if (key === this.lastStateKey) return
      this.lastStateKey = key
      log('chrome-dom:state', state)
      for (const listener of this.listeners) listener(state)
    } catch (error) {
      this.connected = false
      this.lastError = error instanceof Error ? error.message : String(error)
      this.client?.close()
      this.client = undefined
      log('chrome-dom:error', this.lastError)
    }
  }
}

function readDebugPort(): number {
  const raw = process.env.NAPE_NOTIFY_CHROME_DEBUG_PORT
  if (!raw) return DEFAULT_DEBUG_PORT
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_DEBUG_PORT
}
