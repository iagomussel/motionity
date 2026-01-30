const scriptSources = [
  '/js/libraries/localbase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js',
  'https://cdn.jsdelivr.net/npm/@simonwep/selection-js/lib/selection.min.js',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js',
  '/js/libraries/sortable.min.js',
  '/js/libraries/range-slider.min.js',
  '/js/libraries/jquery.nice-select.min.js',
  'https://cdn.jsdelivr.net/npm/@simonwep/pickr/dist/pickr.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/460/fabric.min.js',
  '/js/libraries/anime.min.js',
  'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
  '/js/init.js',
  '/js/ui.js',
  '/js/align.js',
  '/js/converter.js',
  '/js/database.js',
  '/js/lottie.js',
  '/js/text.js',
  '/js/recorder.js',
  '/js/functions.js',
  '/js/events.js'
]

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-legacy="${src}"]`)
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.defer = false
    script.dataset.legacy = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
  })
}

export async function loadLegacyScripts() {
  if (window.__legacyLoaded) return
  window.__legacyLoaded = true
  for (const src of scriptSources) {
    await loadScript(src)
  }
}
