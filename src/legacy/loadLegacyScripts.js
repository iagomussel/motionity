const globalKey = '__legacyLoader'

function getGlobal() {
  if (!window[globalKey]) {
    window[globalKey] = {
      loaded: false,
      loading: null,
      error: null,
      scriptPromises: {},
    }
  }
  return window[globalKey]
}

function loadScript(src, { timeoutMs = 30000 } = {}) {
  const state = getGlobal()
  state.scriptPromises ||= {}

  if (state.scriptPromises[src]) return state.scriptPromises[src]

  state.scriptPromises[src] = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing?.dataset?.legacyLoaded === 'true') {
      resolve()
      return
    }

    const script = existing || document.createElement('script')
    script.src = src
    script.async = false

    let done = false
    const finish = (err) => {
      if (done) return
      done = true
      clearTimeout(timer)
      if (err) {
        // On failure, allow future retries.
        delete state.scriptPromises[src]
        try {
          script.remove()
        } catch {
          // ignore
        }
        reject(err)
        return
      }
      script.dataset.legacyLoaded = 'true'
      resolve()
    }

    const timer = setTimeout(() => {
      finish(new Error(`Timed out loading script after ${timeoutMs}ms: ${src}`))
    }, timeoutMs)

    script.onload = () => finish()
    script.onerror = () => finish(new Error(`Failed to load script: ${src}`))

    if (!existing) document.body.appendChild(script)
  })

  return state.scriptPromises[src]
}

/**
 * Loads legacy scripts sequentially.
 * @param {string[]} scripts
 * @param {(info: {loaded: number, total: number, src: string}) => void} onProgress
 */
export function loadLegacyScripts(scripts, onProgress) {
  const state = getGlobal()
  if (state.loaded) return Promise.resolve()
  if (state.loading) return state.loading

  state.loading = (async () => {
    try {
      const total = scripts.length
      for (let i = 0; i < scripts.length; i += 1) {
        const src = scripts[i]
        // Report what we're about to load.
        onProgress?.({ loaded: i, total, src })
        await loadScript(src)
        // Report that the script has loaded successfully.
        onProgress?.({ loaded: i + 1, total, src })
      }
      state.loaded = true
      state.error = null
    } catch (err) {
      state.error = err
      throw err
    } finally {
      state.loading = null
    }
  })()

  return state.loading
}

export function resetLegacyLoader() {
  const state = getGlobal()
  state.loaded = false
  state.loading = null
  state.error = null
  state.scriptPromises = {}
}
