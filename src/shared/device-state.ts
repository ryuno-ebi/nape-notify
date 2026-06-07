export type LayerId = number | string

export type DeviceAngle = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315

export type StateSource =
  | 'mock'
  | 'chrome-keychron-launcher-dom'
  | 'hotkey'
  | 'hid'
  | 'zmk'
  | 'official'

export type StateConfidence =
  | 'confirmed-ui-observed'
  | 'inferred-from-ui-render'
  | 'inferred'
  | 'unknown'

export type DeviceState = {
  connected: boolean
  layer?: LayerId
  angle?: DeviceAngle
  source: StateSource
  confidence: StateConfidence
  updatedAt: number
  raw?: unknown
}

export type ProviderStatus = {
  running: boolean
  connected: boolean
  message?: string
  lastError?: string
}

export type StateProvider = {
  id: StateSource
  label: string
  cost: 'low' | 'medium' | 'high'
  start(): Promise<void>
  stop(): Promise<void>
  getStatus(): ProviderStatus
  onState(callback: (state: DeviceState) => void): () => void
}

export type OverlayPayload = {
  layer?: LayerId
  angle?: DeviceAngle
  deviceImageUrl?: string
  deviceImageBaseAngle?: number
  title: string
  subtitle?: string
  durationMs: number
}
