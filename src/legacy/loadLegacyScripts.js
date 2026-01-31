const globalKey = '__legacyLoader'

function getGlobal() {
  if (!window[globalKey]) {
    window[globalKey] = {
      loaded: false,
      loading: null,
      error: null,
    }
  }
  return window[globalKey]
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = false
    script.onload = () => resolve()
    script.onerror = (e) => reject(new Error(`Failed to load script: ${src}`))
    document.body.appendChild(script)
  })
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
        onProgress?.({ loaded: i, total, src })
        // eslint-disable-next-line no-await-in-loop
        await loadScript(src)
      }
      onProgress?.({ loaded: total, total, src: scripts[scripts.length - 1] })
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
}
