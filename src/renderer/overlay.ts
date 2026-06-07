import './overlay.css'

const notice = document.querySelector<HTMLElement>('#notice')
const layerEl = document.querySelector<HTMLElement>('#layer')
const deviceImageEl = document.querySelector<HTMLImageElement>('#device-image')
const deviceFallbackEl = document.querySelector<HTMLElement>('#device-fallback')
const titleEl = document.querySelector<HTMLElement>('#title')
const subtitleEl = document.querySelector<HTMLElement>('#subtitle')

let hideTimer: number | undefined

window.napeNotify.onOverlayShow((payload) => {
  if (!notice || !layerEl || !deviceImageEl || !deviceFallbackEl || !titleEl || !subtitleEl) return

  layerEl.textContent = payload.layer === undefined ? '-' : String(payload.layer)
  const activeDeviceEl = payload.deviceImageUrl ? deviceImageEl : deviceFallbackEl
  if (payload.deviceImageUrl && deviceImageEl.src !== payload.deviceImageUrl) {
    deviceImageEl.src = payload.deviceImageUrl
  }
  deviceImageEl.hidden = !payload.deviceImageUrl
  deviceFallbackEl.hidden = Boolean(payload.deviceImageUrl)

  if (payload.angle === undefined) {
    activeDeviceEl.style.setProperty('--device-angle', '0deg')
    activeDeviceEl.classList.add('is-angle-unknown')
  } else {
    const displayAngle = payload.angle - (payload.deviceImageBaseAngle ?? 0)
    activeDeviceEl.style.setProperty('--device-angle', `${displayAngle}deg`)
    activeDeviceEl.classList.remove('is-angle-unknown')
  }
  titleEl.textContent = payload.title
  subtitleEl.textContent = payload.subtitle ?? ''
  subtitleEl.hidden = !payload.subtitle

  notice.classList.remove('is-visible')
  window.requestAnimationFrame(() => notice.classList.add('is-visible'))

  if (hideTimer) window.clearTimeout(hideTimer)
  hideTimer = window.setTimeout(() => {
    notice.classList.remove('is-visible')
  }, payload.durationMs)
})
