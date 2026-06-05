import './overlay.css'

const notice = document.querySelector<HTMLElement>('#notice')
const layerEl = document.querySelector<HTMLElement>('#layer')
const titleEl = document.querySelector<HTMLElement>('#title')
const subtitleEl = document.querySelector<HTMLElement>('#subtitle')

let hideTimer: number | undefined

window.napeNotify.onOverlayShow((payload) => {
  if (!notice || !layerEl || !titleEl || !subtitleEl) return

  layerEl.textContent = payload.layer === undefined ? '-' : String(payload.layer)
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
