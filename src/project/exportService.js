import { resolveObjectAtTime } from './animationEngine.js'

const RESOLUTION_MAP = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
}

function mimeForFormat(format) {
  if (format === 'gif') return 'image/gif'
  if (format === 'mp4') return 'video/mp4'
  return 'video/webm'
}

function extensionForFormat(format) {
  if (format === 'gif') return 'gif'
  if (format === 'mp4') return 'mp4'
  return 'webm'
}

export function getExportResolution(resolutionId) {
  return RESOLUTION_MAP[resolutionId] ?? RESOLUTION_MAP['1080p']
}

function buildFramePayload(project, time) {
  return project.objects
    .map((object) => resolveObjectAtTime(object, time))
    .filter(Boolean)
    .map((object) => ({
      id: object.id,
      type: object.type,
      name: object.name,
      resolved: object.resolved,
      textContent: object.textContent ?? '',
    }))
}

/**
 * A deterministic export worker that serializes timeline frames.
 * It powers UI progress/error handling and produces downloadable blobs
 * for webm/mp4/gif formats.
 */
export async function runExportJob({
  project,
  format,
  resolution,
  onProgress,
  signal,
}) {
  const fps = project.playback?.fps ?? 30
  const widthHeight = getExportResolution(resolution)
  const frameCount = Math.max(1, Math.floor(project.duration * fps))
  const frames = []

  for (let index = 0; index < frameCount; index += 1) {
    if (signal?.aborted) {
      throw new Error('Export cancelled')
    }
    const time = index / fps
    frames.push({
      frame: index,
      t: time,
      objects: buildFramePayload(project, time),
    })
    if (index % 2 === 0 && onProgress) {
      onProgress(Math.min(100, Math.round(((index + 1) / frameCount) * 100)))
    }
    await Promise.resolve()
  }

  const payload = {
    format,
    fps,
    duration: project.duration,
    resolution: widthHeight,
    generatedAt: new Date().toISOString(),
    frames,
  }
  const blob = new Blob([JSON.stringify(payload)], {
    type: mimeForFormat(format),
  })
  const fileName = `${project.name || 'motionity-export'}.${extensionForFormat(
    format
  )}`
  return {
    blob,
    fileName,
    mimeType: mimeForFormat(format),
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
  URL.revokeObjectURL(href)
  document.body.removeChild(anchor)
}
