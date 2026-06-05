import type { OverlayPayload } from '../shared/device-state'

declare global {
  interface Window {
    napeNotify: {
      onOverlayShow(callback: (payload: OverlayPayload) => void): () => void
    }
  }
}

export {}
