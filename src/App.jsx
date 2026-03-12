import { useState, useCallback, useEffect, useRef } from 'react'

import { EditorShell } from './components/layout/EditorShell/EditorShell'
import { TopBar } from './components/layout/TopBar/TopBar'
import { LeftPanel } from './components/layout/LeftPanel/LeftPanel'
import { RightPanel } from './components/layout/RightPanel/RightPanel'
import { CanvasArea } from './components/layout/CanvasArea/CanvasArea'
import { Timeline } from './components/layout/Timeline/Timeline'
import { SaveToast } from './components/ui/SaveToast/SaveToast'
import { ExportModal } from './components/ui/ExportModal/ExportModal'
import { ShareModal } from './components/ui/ShareModal/ShareModal'
import GlobalErrorOverlay from './errorHandling/GlobalErrorOverlay.jsx'
import { isSaveShortcut } from './project/hotkeys.js'
import { saveCurrentProject, loadCurrentProject } from './project/storage.js'
import { createProjectV2 } from './project/model.js'
import {
  deleteKeyframesByTimes,
  getRenderedObjectsAtTime,
  getSelectedObject,
  removeKeyframe,
  replaceKeyframes,
  selectObject,
  selectProperty,
  setCurrentTime,
  togglePlayback,
  upsertKeyframe,
  updateObjectBaseProperty,
} from './project/editorState.js'
import { hasKeyframeAtTime } from './project/animationEngine.js'
import { runExportJob, triggerBrowserDownload } from './project/exportService.js'

const LEFT_TABS = [
  { id: 'media',  icon: '🖼', label: 'Media'  },
  { id: 'text',   icon: 'T',  label: 'Text'   },
  { id: 'shapes', icon: '◻',  label: 'Shapes' },
  { id: 'layers', icon: '⊞',  label: 'Layers' },
]

function nowIso() {
  return new Date().toISOString()
}

function App() {
  const [editorProject, setEditorProject] = useState(() => {
    try {
      const saved = loadCurrentProject({
        storage: window.localStorage,
      })
      if (!saved || saved.version !== 2) {
        return createProjectV2({ now: nowIso(), name: 'Untitled Project' })
      }
      return saved
    } catch {
      return createProjectV2({ now: nowIso(), name: 'Untitled Project' })
    }
  })
  const projectName = editorProject.name

  const [saveStatus, setSaveStatus]       = useState('idle')
  const [activeTool, setActiveTool]       = useState('select')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen]   = useState(false)
  const [exportState, setExportState] = useState({
    status: 'idle',
    progress: 0,
    error: null,
  })
  const exportAbortRef = useRef(null)
  const [selectedKeyframes, setSelectedKeyframes] = useState([])

  const isPlaying = editorProject.playback.isPlaying
  const currentTime = editorProject.currentTime
  const duration = editorProject.duration
  const tracks = editorProject.tracks
  const selectedObject = getSelectedObject(editorProject)
  const renderObjects = getRenderedObjectsAtTime(editorProject, currentTime)
  const isKeyframedAtCurrentTime = Boolean(
    selectedObject &&
      hasKeyframeAtTime(
        selectedObject,
        editorProject.selectedPropertyId,
        currentTime
      )
  )

  // Space → play / pause (ignore when focus is on an input)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        setEditorProject((prev) => togglePlayback(prev))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Ctrl/Cmd+S → save to localStorage
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isSaveShortcut(e)) return
      e.preventDefault()
      setSaveStatus('saving')
      const now = nowIso()
      try {
        saveCurrentProject({
          storage: window.localStorage,
          project: { ...editorProject, updatedAt: now },
          now,
        })
      } catch {
        // ignore – storage may be unavailable
      }
      setSaveStatus('saved')
      const timer = setTimeout(() => setSaveStatus('idle'), 2000)
      return () => clearTimeout(timer)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editorProject])

  useEffect(() => {
    if (!editorProject.playback.isPlaying) return undefined
    let frameId = 0
    let last = performance.now()
    const tick = (now) => {
      const delta = (now - last) / 1000
      last = now
      setEditorProject((prev) => {
        const next = setCurrentTime(prev, prev.currentTime + delta)
        if (next.currentTime >= next.duration) {
          return togglePlayback(setCurrentTime(next, next.duration), false)
        }
        return next
      })
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [editorProject.playback.isPlaying])

  const handleProjectNameChange = useCallback((name) => {
    setEditorProject((prev) => ({
      ...prev,
      name,
      updatedAt: nowIso(),
    }))
  }, [])
  const handleExport  = useCallback(() => setExportModalOpen(true), [])
  const handleShare   = useCallback(() => setShareModalOpen(true), [])
  const handlePlay    = useCallback(() => {
    setEditorProject((prev) => togglePlayback(prev, true))
  }, [])
  const handlePause   = useCallback(() => {
    setEditorProject((prev) => togglePlayback(prev, false))
  }, [])
  const handleSkipStart = useCallback(() => {
    setEditorProject((prev) => setCurrentTime(prev, 0))
  }, [])
  const handleSkipEnd   = useCallback(() => {
    setEditorProject((prev) => setCurrentTime(prev, prev.duration))
  }, [])
  const handleSeek = useCallback((time) => {
    setEditorProject((prev) => setCurrentTime(prev, time))
  }, [])
  const handleStepBackward = useCallback(() => {
    setEditorProject((prev) =>
      setCurrentTime(prev, prev.currentTime - 1 / Math.max(1, prev.playback.fps))
    )
  }, [])
  const handleStepForward = useCallback(() => {
    setEditorProject((prev) =>
      setCurrentTime(prev, prev.currentTime + 1 / Math.max(1, prev.playback.fps))
    )
  }, [])
  const handleZoomIn = useCallback(() => {
    setEditorProject((prev) => ({
      ...prev,
      playback: {
        ...prev.playback,
        zoom: Math.min(3, prev.playback.zoom + 0.1),
      },
    }))
  }, [])
  const handleZoomOut = useCallback(() => {
    setEditorProject((prev) => ({
      ...prev,
      playback: {
        ...prev.playback,
        zoom: Math.max(0.4, prev.playback.zoom - 0.1),
      },
    }))
  }, [])

  const handleObjectSelect = useCallback((objectId) => {
    setEditorProject((prev) => selectObject(prev, objectId))
    setSelectedKeyframes([])
  }, [])

  const handlePropertySelect = useCallback((propertyId) => {
    setEditorProject((prev) => selectProperty(prev, propertyId))
    setSelectedKeyframes([])
  }, [])

  const handlePropertyChange = useCallback((propertyId, value) => {
    setEditorProject((prev) => {
      const objectId = prev.selectedObjectId
      if (!objectId) return prev
      return updateObjectBaseProperty(prev, { objectId, propertyId, value })
    })
  }, [])

  const handleToggleKeyframe = useCallback(() => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object) return prev
      const propertyId = prev.selectedPropertyId
      const hasKey = hasKeyframeAtTime(object, propertyId, prev.currentTime)
      if (hasKey) {
        setSelectedKeyframes([])
        return removeKeyframe(prev, {
          objectId: object.id,
          propertyId,
          time: prev.currentTime,
        })
      }
      const keyValue =
        object.base[propertyId] ??
        object.resolved?.[propertyId] ??
        0
      return upsertKeyframe(prev, {
        objectId: object.id,
        propertyId,
        time: prev.currentTime,
        value: keyValue,
      })
    })
  }, [])

  const handleUpdateKeyframeTimes = useCallback((nextKeys) => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object) return prev
      return replaceKeyframes(prev, {
        objectId: object.id,
        propertyId: prev.selectedPropertyId,
        keyframes: nextKeys,
      })
    })
  }, [])

  const handleDeleteKeyframes = useCallback(() => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object || selectedKeyframes.length === 0) return prev
      const times = selectedKeyframes
        .map((id) => Number(String(id).split(':')[1]))
        .filter((t) => Number.isFinite(t))
      return deleteKeyframesByTimes(prev, {
        objectId: object.id,
        propertyId: prev.selectedPropertyId,
        times,
      })
    })
    setSelectedKeyframes([])
  }, [selectedKeyframes])

  const handleDuplicateKeyframes = useCallback(() => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object || selectedKeyframes.length === 0) return prev
      const fps = Math.max(1, prev.playback.fps)
      const dt = 1 / fps
      const lane = object.keyframes[prev.selectedPropertyId] ?? []
      const selectedSet = new Set(selectedKeyframes)
      const duplicates = lane
        .filter((key) =>
          selectedSet.has(
            `${prev.selectedPropertyId}:${Number(key.t).toFixed(4)}`
          )
        )
        .map((key) => ({
          t: Math.min(prev.duration, key.t + dt),
          value: key.value,
        }))
      return replaceKeyframes(prev, {
        objectId: object.id,
        propertyId: prev.selectedPropertyId,
        keyframes: [...lane, ...duplicates],
      })
    })
  }, [selectedKeyframes])

  const handleExportRun = useCallback(async ({ format, resolution }) => {
    if (exportAbortRef.current) {
      exportAbortRef.current.abort()
    }
    const abortController = new AbortController()
    exportAbortRef.current = abortController
    setExportState({ status: 'exporting', progress: 0, error: null })
    try {
      const result = await runExportJob({
        project: editorProject,
        format,
        resolution,
        signal: abortController.signal,
        onProgress: (progress) =>
          setExportState({
            status: 'exporting',
            progress,
            error: null,
          }),
      })
      triggerBrowserDownload(result)
      setExportState({ status: 'done', progress: 100, error: null })
    } catch (error) {
      setExportState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Export failed',
      })
    }
  }, [editorProject])

  useEffect(() => {
    return () => {
      if (exportAbortRef.current) {
        exportAbortRef.current.abort()
      }
    }
  }, [])

  return (
    <>
      <GlobalErrorOverlay />

      <EditorShell
        topBar={
          <TopBar
            projectName={projectName}
            onProjectNameChange={handleProjectNameChange}
            onExport={handleExport}
            onShare={handleShare}
          />
        }
        leftPanel={<LeftPanel tabs={LEFT_TABS} tracks={tracks} />}
        rightPanel={
          <RightPanel
            hasSelection={Boolean(selectedObject)}
            selectedObject={selectedObject}
            selectedPropertyId={editorProject.selectedPropertyId}
            onSelectProperty={handlePropertySelect}
            onPropertyChange={handlePropertyChange}
            onToggleKeyframe={handleToggleKeyframe}
            isKeyframedAtCurrentTime={isKeyframedAtCurrentTime}
          />
        }
        timeline={
          <Timeline
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            tracks={tracks}
            onPlay={handlePlay}
            onPause={handlePause}
            onSkipToStart={handleSkipStart}
            onSkipToEnd={handleSkipEnd}
            onSeek={handleSeek}
            selectedObject={selectedObject}
            selectedPropertyId={editorProject.selectedPropertyId}
            onSelectProperty={handlePropertySelect}
            onToggleKeyframe={handleToggleKeyframe}
            zoom={editorProject.playback.zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            fps={editorProject.playback.fps}
            selectedKeyframes={selectedKeyframes}
            onSelectedKeyframesChange={setSelectedKeyframes}
            onUpdateKeyframeTimes={handleUpdateKeyframeTimes}
            onDeleteKeyframes={handleDeleteKeyframes}
            onDuplicateKeyframes={handleDuplicateKeyframes}
            onStepBackward={handleStepBackward}
            onStepForward={handleStepForward}
          />
        }
      >
        <CanvasArea
          activeTool={activeTool}
          onToolChange={setActiveTool}
          zoom={editorProject.playback.zoom}
          renderObjects={renderObjects}
          selectedObjectId={editorProject.selectedObjectId}
          onSelectObject={handleObjectSelect}
        />
      </EditorShell>

      <SaveToast status={saveStatus} />

      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExportRun}
        exportState={exportState}
      />

      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        projectName={projectName}
      />
    </>
  )
}

export default App
