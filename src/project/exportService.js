import { renderFrame, preloadMediaElements, seekVideo } from './canvasRenderer.js'

const RESOLUTION_MAP = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
}

export function getExportResolution(resolutionId) {
  return RESOLUTION_MAP[resolutionId] ?? RESOLUTION_MAP['1080p']
}

/**
 * Export project as a real video file using Canvas + MediaRecorder.
 * Produces actual WebM video (or falls back to PNG sequence for GIF).
 */
export async function runExportJob({
  project,
  format = 'webm',
  resolution = '1080p',
  onProgress,
  signal,
}) {
  const fps = project.playback?.fps ?? 30
  const { width, height } = getExportResolution(resolution)
  const frameCount = Math.max(1, Math.floor(project.duration * fps))
  const frameDuration = 1000 / fps

  // Pre-load all media
  onProgress?.(1)
  const mediaElements = await preloadMediaElements(project)

  // Attach media elements to project objects for rendering
  const projectWithMedia = {
    ...project,
    objects: project.objects.map((obj) => {
      const el = mediaElements.get(obj.id)
      if (!el) return obj
      return { ...obj, source: { ...obj.source, element: el } }
    }),
  }

  if (format === 'png') {
    return exportSingleFrame(projectWithMedia, width, height, project.currentTime)
  }

  if (format === 'gif') {
    return exportGif(projectWithMedia, width, height, fps, frameCount, onProgress, signal)
  }

  // WebM/MP4 via MediaRecorder
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const stream = canvas.captureStream(0)

  // Collect audio tracks from video/audio elements
  const audioCtx = new AudioContext()
  const audioDest = audioCtx.createMediaStreamDestination()
  let hasAudio = false

  for (const obj of projectWithMedia.objects) {
    if ((obj.type === 'video' || obj.type === 'audio') && obj.source?.element) {
      try {
        const source = audioCtx.createMediaElementSource(obj.source.element)
        const gain = audioCtx.createGain()
        gain.gain.value = obj.media?.muted ? 0 : (obj.media?.volume ?? 1)
        source.connect(gain)
        gain.connect(audioDest)
        hasAudio = true
      } catch {
        // element may already be connected or not have audio
      }
    }
  }

  if (hasAudio) {
    for (const track of audioDest.stream.getAudioTracks()) {
      stream.addTrack(track)
    }
  }

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
      ? 'video/webm;codecs=vp8,opus'
      : 'video/webm'

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: resolution === '4k' ? 20_000_000 : resolution === '720p' ? 5_000_000 : 10_000_000,
  })

  const chunks = []
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  const recordingDone = new Promise((resolve) => {
    recorder.onstop = () => resolve()
  })

  recorder.start()

  // Render frame by frame
  for (let i = 0; i < frameCount; i++) {
    if (signal?.aborted) {
      recorder.stop()
      throw new Error('Export cancelled')
    }

    const time = i / fps

    // Seek video elements to correct time
    for (const obj of projectWithMedia.objects) {
      if (obj.type === 'video' && obj.source?.element) {
        const offset = time - (obj.visibleRange?.start ?? 0)
        if (offset >= 0) {
          await seekVideo(obj.source.element, offset)
        }
      }
    }

    renderFrame(ctx, projectWithMedia, time, width, height)

    // Request a frame from the capture stream
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack?.requestFrame) {
      videoTrack.requestFrame()
    }

    // Wait for frame duration
    await new Promise((resolve) => setTimeout(resolve, frameDuration / 4))

    if (i % 3 === 0) {
      onProgress?.(Math.min(95, Math.round(((i + 1) / frameCount) * 95)))
    }
  }

  recorder.stop()
  await recordingDone

  if (hasAudio) {
    try { await audioCtx.close() } catch { /* ignore */ }
  }

  onProgress?.(100)

  const blob = new Blob(chunks, { type: 'video/webm' })
  const extension = format === 'mp4' ? 'webm' : 'webm'
  const fileName = `${project.name || 'motionity-export'}.${extension}`

  return { blob, fileName, mimeType: 'video/webm' }
}

function exportSingleFrame(project, width, height, time) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  renderFrame(ctx, project, time, width, height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve({
        blob,
        fileName: `${project.name || 'motionity-frame'}.png`,
        mimeType: 'image/png',
      })
    }, 'image/png')
  })
}

async function exportGif(project, width, height, fps, frameCount, onProgress, signal) {
  // GIF export: render frames as individual canvas snapshots and encode
  // For now, export as WebM (GIF encoding requires a library like gif.js)
  const canvas = document.createElement('canvas')
  canvas.width = Math.min(width, 640)
  canvas.height = Math.min(height, 360)
  const ctx = canvas.getContext('2d')
  const frames = []

  for (let i = 0; i < frameCount; i++) {
    if (signal?.aborted) throw new Error('Export cancelled')
    const time = i / fps
    renderFrame(ctx, project, time, canvas.width, canvas.height)
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
    if (i % 5 === 0) onProgress?.(Math.min(95, Math.round((i / frameCount) * 95)))
  }

  // Fallback: export as WebM since native GIF encoding needs gif.js
  const stream = canvas.captureStream(0)
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
  const chunks = []
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
  const done = new Promise((r) => { recorder.onstop = r })
  recorder.start()

  for (let i = 0; i < frames.length; i++) {
    ctx.putImageData(frames[i], 0, 0)
    const vt = stream.getVideoTracks()[0]
    if (vt?.requestFrame) vt.requestFrame()
    await new Promise((r) => setTimeout(r, 1000 / fps / 4))
  }

  recorder.stop()
  await done
  onProgress?.(100)

  return {
    blob: new Blob(chunks, { type: 'video/webm' }),
    fileName: `${project.name || 'motionity-export'}.webm`,
    mimeType: 'video/webm',
  }
}

export function triggerBrowserDownload({ blob, fileName }) {
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = fileName
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  setTimeout(() => {
    URL.revokeObjectURL(href)
    document.body.removeChild(anchor)
  }, 100)
}
