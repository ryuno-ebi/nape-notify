import type { DeviceAngle, DeviceState, StateProvider } from '../../shared/device-state.js'
import { log } from '../logger.js'

const angles: DeviceAngle[] = [0, 45, 90, 135, 180, 225, 270, 315]

export class MockProvider implements StateProvider {
  readonly id = 'mock'
  readonly label = 'Mock Provider'
  readonly cost = 'low'

  private timer: NodeJS.Timeout | undefined
  private listeners = new Set<(state: DeviceState) => void>()
  private running = false
  private layer = 0
  private angleIndex = 0

  async start(): Promise<void> {
    if (this.running) return
    this.running = true
    log('mock:start')
    this.emit()
    this.timer = setInterval(() => {
      this.layer = (this.layer + 1) % 8
      this.angleIndex = (this.angleIndex + 1) % angles.length
      this.emit()
    }, 4500)
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = undefined
    this.running = false
    log('mock:stop')
  }

  getStatus() {
    return {
      running: this.running,
      connected: this.running,
      message: this.running ? 'Mock data is running' : 'Mock data is stopped'
    }
  }

  onState(callback: (state: DeviceState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private emit(): void {
    const state: DeviceState = {
      connected: true,
      layer: this.layer,
      angle: angles[this.angleIndex],
      source: 'mock',
      confidence: 'inferred',
      updatedAt: Date.now()
    }
    for (const listener of this.listeners) listener(state)
    log('mock:emit', state)
  }
}
