import type { Settings } from './settings.ts';

(function () {
  let overlay: HTMLElement | undefined

  function create() {
    overlay = document.createElement('dimmer-overlay')
    overlay.style.backgroundColor = '#000'
    overlay.style.inset = '0'
    overlay.style.mixBlendMode = 'multiply'
    overlay.style.opacity = '0'
    overlay.style.pointerEvents = 'none'
    overlay.style.position = 'fixed'
    overlay.style.transitionDuration = '0.15s'
    overlay.style.transitionProperty = 'visibility, opacity'
    overlay.style.transitionTimingFunction = 'ease'
    overlay.style.visibility = 'hidden'
    overlay.style.zIndex = '2147483647'

    document.documentElement.appendChild(overlay)

    return overlay
  }

  async function load() {
    let settings: Settings

    try {
      settings = JSON.parse(localStorage.getItem('dimmer-overlay') || '')
    }
    catch {
      settings = await chrome.runtime.sendMessage({ type: 'getSettings' })
    }

    update(settings)
  }

  function update(settings: Settings) {
    if (!overlay || !document.documentElement.contains(overlay))
      overlay = create()

    const mode = settings[settings.url.mode]

    overlay.style.backgroundColor = mode.overlay.color
    overlay.style.mixBlendMode = mode.overlay.blend
    overlay.style.opacity = settings.url.on ? String(mode.overlay.opacity) : '0'
    overlay.style.visibility = settings.url.on ? 'visible' : 'hidden'
  }

  overlay = create()
  load()

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'update') {
      try {
        localStorage.setItem('dimmer-overlay', JSON.stringify(message.payload.settings))
      }
      catch {}

      update(message.payload.settings)
    }
  })
})()
