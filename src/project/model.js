import { listAnimatablePropertyIds } from './propertyRegistry.js'

function toKeyframeRecord(values = {}) {
  const record = {}
  for (const property of listAnimatablePropertyIds()) {
    const value = values[property]
    if (value !== undefined) {
      record[property] = [{ t: 0, value }]
    } else {
      record[property] = []
    }
  }
  return record
}

function createDemoObjects() {
  return [
    {
      id: 'obj-title',
      name: 'Title',
      type: 'text',
      trackId: 'track-video-main',
      clipId: 'clip-video-main',
      base: {
        left: 240,
        top: 220,
        width: 520,
        height: 120,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        opacity: 1,
        fill: '#7c3aed',
        stroke: '#ffffff',
        strokeWidth: 0,
        charSpacing: 0,
        lineHeight: 1.2,
        rx: 0,
        ry: 0,
        'shadow.color': '#000000',
        'shadow.opacity': 0.25,
        'shadow.offsetX': 0,
        'shadow.offsetY': 8,
        'shadow.blur': 20,
      },
      textContent: 'Motionity',
      keyframes: toKeyframeRecord({
        opacity: 1,
      }),
      visibleRange: {
        start: 0,
        end: 15,
      },
    },
    {
      id: 'obj-box',
      name: 'Accent Box',
      type: 'rect',
      trackId: 'track-video-main',
      clipId: 'clip-video-main',
      base: {
        left: 180,
        top: 380,
        width: 620,
        height: 120,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
        opacity: 0.65,
        fill: '#14b8a6',
        stroke: '#0f172a',
        strokeWidth: 3,
        charSpacing: 0,
        lineHeight: 1,
        rx: 24,
        ry: 24,
        'shadow.color': '#000000',
        'shadow.opacity': 0.2,
        'shadow.offsetX': 0,
        'shadow.offsetY': 10,
        'shadow.blur': 24,
      },
      keyframes: toKeyframeRecord({
        opacity: 0.65,
        rx: 24,
        ry: 24,
      }),
      visibleRange: {
        start: 0,
        end: 15,
      },
    },
  ]
}

function createDefaultTracks(durationSeconds) {
  return [
    {
      id: 'track-video-main',
      label: 'Video',
      type: 'video',
      clips: [
        {
          id: 'clip-video-main',
          start: 0,
          end: durationSeconds,
          trimStart: 0,
          trimEnd: durationSeconds,
          label: 'Main composition',
        },
      ],
    },
  ]
}

/**
 * Creates the new editor model used by the React runtime.
 * @param {{now: string, name: string, duration?: number}} params
 */
export function createProjectV2({ now, name, duration = 15 }) {
  const safeDuration = Math.max(1, Number(duration) || 15)
  return {
    version: 2,
    name,
    createdAt: now,
    updatedAt: now,
    duration: safeDuration,
    currentTime: 0,
    playback: {
      isPlaying: false,
      fps: 30,
      zoom: 1,
    },
    tracks: createDefaultTracks(safeDuration),
    objects: createDemoObjects(),
    selectedObjectId: 'obj-title',
    selectedPropertyId: 'left',
  }
}
