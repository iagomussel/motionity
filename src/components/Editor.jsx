import { useCallback, useMemo, useState } from 'react'
import CanvasStage from './CanvasStage'
import Timeline from './Timeline'
import usePlayback from '../hooks/usePlayback'

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
  const [objects, setObjects] = useState(() => [createRect('rect-1')])
  const [selectedId, setSelectedId] = useState('rect-1')
  const [duration] = useState(DEFAULT_DURATION)
  const { currentTime, isPlaying, toggle, seek } = usePlayback({
    duration
  })

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

  return (
    <div className="editor-shell">
      <header className="editor-header">
        <div className="brand">
          <span className="brand-accent">Velo</span>Motion
        </div>
        <div className="editor-actions">
          <button type="button" onClick={handleAddRect}>
            Add Rect
          </button>
          <button type="button" onClick={handleAddText}>
            Add Text
          </button>
        </div>
      </header>
      <main className="editor-main">
        <CanvasStage
          objects={objects}
          selectedId={selectedId}
          onSelect={handleSelect}
          onChange={updateObject}
        />
      </main>
      <Timeline
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayToggle={toggle}
        onTimeChange={seek}
        onReset={() => seek(0)}
        items={timelineItems}
      />
    </div>
  )
}

export default Editor
