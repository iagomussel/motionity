import { useCallback, useMemo, useState } from 'react'
import DesktopEditor from './DesktopEditor'
import MobileEditor from './MobileEditor'
import usePlayback from '../hooks/usePlayback'
import useMediaQuery from '../hooks/useMediaQuery'
import useViewportUnit from '../hooks/useViewportUnit'

const DEFAULT_DURATION = 15

function createRect(id) {
  return {
    id,
    type: 'rect',
    x: 120,
    y: 120,
    width: 160,
    height: 100,
    fill: '#3B82F6',
    rotation: 0,
    keyframes: [0]
  }
}

function createText(id) {
  return {
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
    keyframes: [0]
  }
}

function Editor() {
  useViewportUnit()
  const [objects, setObjects] = useState(() => [createRect('rect-1')])
  const [selectedId, setSelectedId] = useState('rect-1')
  const [duration] = useState(DEFAULT_DURATION)
  const { currentTime, isPlaying, toggle, seek } = usePlayback({
    duration
  })
  const isMobile = useMediaQuery('(max-width: 900px)')

  const handleAddRect = () => {
    setObjects((prev) => {
      const nextId = `rect-${prev.length + 1}`
      return [...prev, createRect(nextId)]
    })
    setSelectedId(`rect-${objects.length + 1}`)
  }

  const handleAddText = () => {
    setObjects((prev) => {
      const nextId = `text-${prev.length + 1}`
      return [...prev, createText(nextId)]
    })
    setSelectedId(`text-${objects.length + 1}`)
  }

  const addKeyframe = useCallback(
    (id) => {
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id !== id) return obj
          if (obj.keyframes.includes(currentTime)) return obj
          return {
            ...obj,
            keyframes: [...obj.keyframes, currentTime].sort((a, b) => a - b)
          }
        })
      )
    },
    [currentTime]
  )

  const updateObject = useCallback((id, attrs) => {
    setObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...attrs } : obj))
    )
    addKeyframe(id)
  }, [addKeyframe])

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
  }, [])

  const timelineItems = useMemo(
    () =>
      objects.map((obj) => ({
        id: obj.id,
        label: obj.type === 'text' ? `Text ${obj.id}` : `Rect ${obj.id}`,
        keyframes: obj.keyframes
      })),
    [objects]
  )

  const sharedProps = {
    objects,
    selectedId,
    onSelect: handleSelect,
    onChange: updateObject,
    onAddRect: handleAddRect,
    onAddText: handleAddText,
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
