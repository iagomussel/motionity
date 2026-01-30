import { useCallback, useMemo, useState } from 'react'
import DesktopEditor from './DesktopEditor'
import MobileEditor from './MobileEditor'
import usePlayback from '../hooks/usePlayback'
import useMediaQuery from '../hooks/useMediaQuery'
import useViewportUnit from '../hooks/useViewportUnit'

const DEFAULT_DURATION = 15
const SNAPSHOT_FIELDS = [
  'x',
  'y',
  'width',
  'height',
  'radius',
  'rotation',
  'fill',
  'text',
  'fontSize'
]

function buildSnapshot(obj) {
  return SNAPSHOT_FIELDS.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key]
    }
    return acc
  }, {})
}

function createRect(id) {
  const base = {
    id,
    type: 'rect',
    x: 120,
    y: 120,
    width: 160,
    height: 100,
    fill: '#3B82F6',
    rotation: 0,
    trimStart: 0,
    trimEnd: DEFAULT_DURATION,
  }
  return {
    ...base,
    keyframes: [{ time: 0, props: buildSnapshot(base) }]
  }
}

function createText(id) {
  const base = {
    id,
    type: 'text',
    x: 180,
    y: 220,
    width: 200,
    height: 40,
    text: 'Edit me',
    fontSize: 24,
    fill: '#E2E8F0',
    rotation: 0,
    trimStart: 0,
    trimEnd: DEFAULT_DURATION,
  }
  return {
    ...base,
    keyframes: [{ time: 0, props: buildSnapshot(base) }]
  }
}

function createCircle(id) {
  const base = {
    id,
    type: 'circle',
    x: 220,
    y: 180,
    radius: 60,
    fill: '#8B5CF6',
    rotation: 0,
    trimStart: 0,
    trimEnd: DEFAULT_DURATION,
  }
  return {
    ...base,
    keyframes: [{ time: 0, props: buildSnapshot(base) }]
  }
}

function createImage(id, src) {
  const base = {
    id,
    type: 'image',
    x: 160,
    y: 140,
    width: 220,
    height: 140,
    rotation: 0,
    src,
    cropX: 0,
    cropY: 0,
    cropWidth: 220,
    cropHeight: 140,
    trimStart: 0,
    trimEnd: DEFAULT_DURATION,
  }
  return {
    ...base,
    keyframes: [{ time: 0, props: buildSnapshot(base) }]
  }
}

function interpolateValue(start, end, t) {
  return start + (end - start) * t
}

function buildInterpolatedProps(keyframes, time) {
  if (!keyframes?.length) return {}
  const sorted = [...keyframes].sort((a, b) => a.time - b.time)
  if (time <= sorted[0].time) return sorted[0].props
  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].props
  }

  const nextIndex = sorted.findIndex((frame) => frame.time >= time)
  const prevFrame = sorted[Math.max(0, nextIndex - 1)]
  const nextFrame = sorted[nextIndex]
  if (!prevFrame || !nextFrame) return prevFrame?.props ?? {}
  if (prevFrame.time === nextFrame.time) return prevFrame.props

  const t = (time - prevFrame.time) / (nextFrame.time - prevFrame.time)
  const merged = {}
  const keys = new Set([
    ...Object.keys(prevFrame.props),
    ...Object.keys(nextFrame.props)
  ])
  keys.forEach((key) => {
    const start = prevFrame.props[key]
    const end = nextFrame.props[key]
    if (typeof start === 'number' && typeof end === 'number') {
      merged[key] = interpolateValue(start, end, t)
    } else {
      merged[key] = start ?? end
    }
  })
  return merged
}

function Editor() {
  useViewportUnit()
  const [objects, setObjects] = useState(() => [createRect('rect-1')])
  const [selectedId, setSelectedId] = useState('rect-1')
  const [duration] = useState(DEFAULT_DURATION)
  const [cropActive, setCropActive] = useState(false)
  const { currentTime, isPlaying, toggle, seek } = usePlayback({
    duration
  })
  const isMobile = useMediaQuery('(max-width: 900px)')

  const handleAddRect = () => {
    let createdId = null
    setObjects((prev) => {
      const nextId = `rect-${prev.length + 1}`
      createdId = nextId
      return [...prev, createRect(nextId)]
    })
    if (createdId) setSelectedId(createdId)
  }

  const handleAddText = () => {
    let createdId = null
    setObjects((prev) => {
      const nextId = `text-${prev.length + 1}`
      createdId = nextId
      return [...prev, createText(nextId)]
    })
    if (createdId) setSelectedId(createdId)
  }

  const handleAddImage = () => {
    let createdId = null
    setObjects((prev) => {
      const nextId = `image-${prev.length + 1}`
      createdId = nextId
      return [...prev, createImage(nextId, '/assets/beach.png')]
    })
    if (createdId) setSelectedId(createdId)
  }

  const handleAddAsset = useCallback(
    (asset, position) => {
      if (!asset) return
      let createdId = null
      setObjects((prev) => {
        const nextId = `${asset.type}-${prev.length + 1}`
        createdId = nextId
        let created
        if (asset.type === 'text') {
          created = createText(nextId)
        } else if (asset.type === 'circle') {
          created = createCircle(nextId)
        } else if (asset.type === 'image') {
          created = createImage(nextId, asset.src)
        } else {
          created = createRect(nextId)
        }
        if (asset.fill) created.fill = asset.fill
        if (position?.x != null && position?.y != null) {
          created.x = position.x
          created.y = position.y
        }
        created.keyframes = [
          { time: 0, props: buildSnapshot(created) }
        ]
        return [...prev, created]
      })
      if (createdId) setSelectedId(createdId)
    },
    []
  )

  const handleDuplicate = useCallback(() => {
    let createdId = null
    setObjects((prev) => {
      const target = prev.find((obj) => obj.id === selectedId)
      if (!target) return prev
      const nextId = `${target.type}-${prev.length + 1}`
      createdId = nextId
      const duplicate = {
        ...target,
        id: nextId,
        x: target.x + 24,
        y: target.y + 24,
        keyframes: target.keyframes.map((frame) => ({
          time: frame.time,
          props: { ...frame.props }
        }))
      }
      return [...prev, duplicate]
    })
    if (createdId) setSelectedId(createdId)
  }, [selectedId])

  const handleDelete = useCallback(() => {
    setObjects((prev) => prev.filter((obj) => obj.id !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const updateObject = useCallback((id, attrs) => {
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== id) return obj
        const updated = { ...obj, ...attrs }
        const snapshot = buildSnapshot(updated)
        const existingIndex = updated.keyframes.findIndex(
          (frame) => frame.time === currentTime
        )
        let nextKeyframes = updated.keyframes
        if (existingIndex >= 0) {
          nextKeyframes = updated.keyframes.map((frame, index) =>
            index === existingIndex ? { time: frame.time, props: snapshot } : frame
          )
        } else {
          nextKeyframes = [...updated.keyframes, { time: currentTime, props: snapshot }]
        }
        nextKeyframes.sort((a, b) => a.time - b.time)
        return { ...updated, keyframes: nextKeyframes }
      })
    )
  }, [currentTime])

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
  }, [])

  const timelineItems = useMemo(
    () =>
      objects.map((obj) => ({
        id: obj.id,
        label: obj.type === 'text' ? `Text ${obj.id}` : `Rect ${obj.id}`,
        keyframes: obj.keyframes.map((frame) => frame.time)
      })),
    [objects]
  )

  const displayObjects = useMemo(
    () =>
      objects.map((obj) => {
        const props = buildInterpolatedProps(obj.keyframes, currentTime)
        const trimStart = obj.trimStart ?? 0
        const trimEnd = obj.trimEnd ?? duration
        const visible = currentTime >= trimStart && currentTime <= trimEnd
        return {
          ...obj,
          ...props,
          visible
        }
      }),
    [objects, currentTime, duration]
  )

  const cropTarget = useMemo(
    () => objects.find((obj) => obj.id === selectedId) ?? null,
    [objects, selectedId]
  )

  const handleCropChange = useCallback((next) => {
    if (!selectedId) return
    setObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== selectedId) return obj
        return {
          ...obj,
          cropX: next.cropX,
          cropY: next.cropY,
          cropWidth: next.cropWidth,
          cropHeight: next.cropHeight,
          trimStart: Math.max(0, Math.min(next.trimStart, duration)),
          trimEnd: Math.max(0, Math.min(next.trimEnd, duration))
        }
      })
    )
  }, [selectedId, duration])

  const sharedProps = {
    buildId: import.meta.env.VITE_BUILD_ID,
    objects: displayObjects,
    selectedId,
    onSelect: handleSelect,
    onChange: updateObject,
    onAddRect: handleAddRect,
    onAddText: handleAddText,
    onAddImage: handleAddImage,
    onAddAsset: handleAddAsset,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
    onCropToggle: () => setCropActive((prev) => !prev),
    cropActive,
    cropTarget,
    onCropChange: handleCropChange,
    onCloseCrop: () => setCropActive(false),
    timelineItems,
    duration,
    currentTime,
    isPlaying,
    onPlayToggle: toggle,
    onTimeChange: seek,
    onResetTime: () => seek(0)
  }

  if (isMobile) {
    return <MobileEditor {...sharedProps} />
  }

  return <DesktopEditor {...sharedProps} />
}

export default Editor
