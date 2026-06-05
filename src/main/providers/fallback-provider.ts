import type { DeviceState, ProviderStatus, StateProvider } from '../../shared/device-state.js'
import { log } from '../logger.js'

export class FallbackProvider implements StateProvider {
  readonly cost = 'medium'

  private active: StateProvider | undefined
  private listeners = new Set<(state: DeviceState) => void>()
  private unsubscribe: (() => void) | undefined
  private fallbackTimer: NodeJS.Timeout | undefined
  private running = false

  constructor(
    private readonly primary: StateProvider,
    private readonly fallback: StateProvider,
    private readonly fallbackDelayMs = 3500
  ) {}

  get id() {
    return this.primary.id
  }

  get label() {
    return `${this.primary.label} with fallback`
  }

  async start(): Promise<void> {
    if (this.running) return
    this.running = true
    await this.useProvider(this.primary)
    this.fallbackTimer = setTimeout(() => {
      if (this.active !== this.primary) return
      if (this.primary.getStatus().connected) return
      log('fallback:switch-to-fallback', this.primary.getStatus())
      void this.useProvider(this.fallback)
    }, this.fallbackDelayMs)
  }

  async stop(): Promise<void> {
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer)
    this.fallbackTimer = undefined
    this.unsubscribe?.()
    this.unsubscribe = undefined
    await this.active?.stop()
    this.active = undefined
    this.running = false
  }

  getStatus(): ProviderStatus {
    return this.active?.getStatus() ?? {
      running: this.running,
      connected: false,
      message: 'No active provider'
    }
  }

  onState(callback: (state: DeviceState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private async useProvider(provider: StateProvider): Promise<void> {
    if (this.active === provider) return
    this.unsubscribe?.()
    this.unsubscribe = undefined
    await this.active?.stop()
    this.active = provider
    this.unsubscribe = provider.onState((state) => {
      for (const listener of this.listeners) listener(state)
    })
    log('fallback:provider-start', { id: provider.id, label: provider.label })
    await provider.start()
  }
}
