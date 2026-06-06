import './overlay.css'

const notice = document.querySelector<HTMLElement>('#notice')
const layerEl = document.querySelector<HTMLElement>('#layer')
const deviceEl = document.querySelector<HTMLElement>('#device')
const titleEl = document.querySelector<HTMLElement>('#title')
const subtitleEl = document.querySelector<HTMLElement>('#subtitle')

let hideTimer: number | undefined

window.napeNotify.onOverlayShow((payload) => {
  if (!notice || !layerEl || !deviceEl || !titleEl || !subtitleEl) return

  layerEl.textContent = payload.layer === undefined ? '-' : String(payload.layer)
  if (payload.angle === undefined) {
    deviceEl.style.setProperty('--device-angle', '0deg')
    deviceEl.classList.add('is-angle-unknown')
  } else {
    deviceEl.style.setProperty('--device-angle', `${payload.angle}deg`)
    deviceEl.classList.remove('is-angle-unknown')
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
