import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

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
  appendObject,
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
  updateObjectBaseProperties,
  updateObjectTextField,
} from './project/editorState.js'
import { hasKeyframeAtTime } from './project/animationEngine.js'
import { runExportJob, triggerBrowserDownload } from './project/exportService.js'
import { listAnimatablePropertyIds } from './project/propertyRegistry.js'

const LEFT_TABS = [
  { id: 'media',  label: 'Media'  },
  { id: 'text',   label: 'Text'   },
  { id: 'shapes', label: 'Shapes' },
  { id: 'layers', label: 'Layers' },
]

const AUTOSAVE_DELAY = 2000

function nowIso() {
  return new Date().toISOString()
}

const EMPTY_KEYFRAMES = (() => {
  const kf = {}
  listAnimatablePropertyIds().forEach((id) => { kf[id] = [] })
  return kf
})()

function makeEmptyKeyframes() {
  const kf = {}
  for (const id of Object.keys(EMPTY_KEYFRAMES)) {
    kf[id] = []
  }
  return kf
}

function buildObject({ id, name, type, base, textContent = '', textStyle = null, source = null }) {
  return {
    id,
    name,
    type,
    trackId: 'track-video-main',
    clipId: 'clip-video-main',
    base,
    textContent,
    textStyle,
    source,
    keyframes: makeEmptyKeyframes(),
    visibleRange: { start: 0, end: 15 },
  }
}

function App() {
  const [editorProject, setEditorProject] = useState(() => {
    try {
      const saved = loadCurrentProject({ storage: window.localStorage })
      if (saved && saved.version === 2) return saved
    } catch { /* ignore */ }
    return createProjectV2({ now: nowIso(), name: 'Untitled Project' })
  })

  const [saveStatus, setSaveStatus]       = useState('idle')
  const [activeTool, setActiveTool]       = useState('select')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen]   = useState(false)
  const [exportState, setExportState] = useState({ status: 'idle', progress: 0, error: null })
  const exportAbortRef = useRef(null)
  const [selectedKeyframes, setSelectedKeyframes] = useState([])
  const uploadInputRef = useRef(null)
  const autoSaveTimerRef = useRef(null)
  const projectRef = useRef(editorProject)
  projectRef.current = editorProject

  // --- Derived state with memoization ---
  const selectedObject = useMemo(
    () => getSelectedObject(editorProject),
    [editorProject.selectedObjectId, editorProject.objects]
  )

  const renderObjects = useMemo(
    () => getRenderedObjectsAtTime(editorProject, editorProject.currentTime),
    [editorProject.objects, editorProject.currentTime]
  )

  const isKeyframedAtCurrentTime = useMemo(() => {
    if (!selectedObject) return false
    return hasKeyframeAtTime(selectedObject, editorProject.selectedPropertyId, editorProject.currentTime)
  }, [selectedObject, editorProject.selectedPropertyId, editorProject.currentTime])

  const projectName = editorProject.name
  const isPlaying = editorProject.playback.isPlaying
  const currentTime = editorProject.currentTime
  const duration = editorProject.duration
  const tracks = editorProject.tracks

  // --- Auto-save to localStorage ---
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      try {
        const now = nowIso()
        saveCurrentProject({
          storage: window.localStorage,
          project: { ...projectRef.current, updatedAt: now },
          now,
        })
      } catch { /* storage unavailable */ }
    }, AUTOSAVE_DELAY)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [editorProject.objects, editorProject.name, editorProject.tracks])

  // Space -> play/pause
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return
      if (e.code === 'Space') {
        e.preventDefault()
        setEditorProject((prev) => togglePlayback(prev))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Ctrl/Cmd+S manual save
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isSaveShortcut(e)) return
      e.preventDefault()
      setSaveStatus('saving')
      try {
        const now = nowIso()
        saveCurrentProject({
          storage: window.localStorage,
          project: { ...projectRef.current, updatedAt: now },
          now,
        })
      } catch { /* ignore */ }
      setSaveStatus('saved')
      const timer = setTimeout(() => setSaveStatus('idle'), 2000)
      return () => clearTimeout(timer)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Playback loop
  useEffect(() => {
    if (!isPlaying) return undefined
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
  }, [isPlaying])

  // --- Handlers ---
  const handleProjectNameChange = useCallback((name) => {
    setEditorProject((prev) => ({ ...prev, name, updatedAt: nowIso() }))
  }, [])

  const handleExport  = useCallback(() => setExportModalOpen(true), [])
  const handleShare   = useCallback(() => setShareModalOpen(true), [])

  const handlePlay = useCallback(() => {
    setEditorProject((prev) => togglePlayback(prev, true))
  }, [])
  const handlePause = useCallback(() => {
    setEditorProject((prev) => togglePlayback(prev, false))
  }, [])
  const handleSkipStart = useCallback(() => {
    setEditorProject((prev) => setCurrentTime(prev, 0))
  }, [])
  const handleSkipEnd = useCallback(() => {
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
      playback: { ...prev.playback, zoom: Math.min(3, prev.playback.zoom + 0.1) },
    }))
  }, [])
  const handleZoomOut = useCallback(() => {
    setEditorProject((prev) => ({
      ...prev,
      playback: { ...prev.playback, zoom: Math.max(0.4, prev.playback.zoom - 0.1) },
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
      let next = updateObjectBaseProperty(prev, { objectId, propertyId, value })
      next = upsertKeyframe(next, { objectId, propertyId, time: next.currentTime, value })
      return next
    })
  }, [])

  const handleObjectMove = useCallback((objectId, patch, commitKeyframe = false) => {
    setEditorProject((prev) => {
      let next = updateObjectBaseProperties(prev, { objectId, patch })
      if (!commitKeyframe) return next
      for (const [key, val] of Object.entries(patch)) {
        next = upsertKeyframe(next, { objectId, propertyId: key, time: next.currentTime, value: val })
      }
      return next
    })
  }, [])

  const handleObjectResize = useCallback((objectId, patch, commitKeyframe = false) => {
    setEditorProject((prev) => {
      let next = updateObjectBaseProperties(prev, { objectId, patch })
      if (!commitKeyframe) return next
      for (const [key, val] of Object.entries(patch)) {
        next = upsertKeyframe(next, { objectId, propertyId: key, time: next.currentTime, value: val })
      }
      return next
    })
  }, [])

  const handleAddTextPreset = useCallback((preset) => {
    setEditorProject((prev) => {
      const id = `obj-text-${Date.now()}`
      const style = preset?.textStyle ?? {}
      const fontSize = style.fontSize ?? 48
      const object = buildObject({
        id,
        name: preset?.label ?? 'Text',
        type: 'text',
        textContent: preset?.defaultText ?? preset?.label ?? 'Your text here',
        textStyle: {
          fontFamily: style.fontFamily ?? 'Inter, sans-serif',
          fontSize,
          fontWeight: style.fontWeight ?? 400,
          fontStyle: style.fontStyle ?? 'normal',
          textDecoration: style.textDecoration ?? 'none',
          textAlign: style.textAlign ?? 'center',
          textTransform: style.textTransform ?? 'none',
          lineHeight: style.lineHeight ?? 1.3,
          letterSpacing: style.letterSpacing ?? 0,
          textBackground: style.textBackground ?? 'transparent',
        },
        base: {
          left: 280, top: 240, width: 520, height: Math.ceil(fontSize * 1.4) + 16,
          scaleX: 1, scaleY: 1, angle: 0, opacity: 1,
          fill: style.color ?? '#ffffff', stroke: '#000000', strokeWidth: 0,
          charSpacing: 0, lineHeight: 1.3, rx: 0, ry: 0,
          'shadow.color': '#000000', 'shadow.opacity': 0,
          'shadow.offsetX': 0, 'shadow.offsetY': 0, 'shadow.blur': 0,
        },
      })
      return appendObject(prev, object)
    })
  }, [])

  const handleTextContentChange = useCallback((objectId, text) => {
    setEditorProject((prev) =>
      updateObjectTextField(prev, { objectId, field: 'textContent', value: text })
    )
  }, [])

  const handleTextStyleChange = useCallback((objectId, field, value) => {
    setEditorProject((prev) =>
      updateObjectTextField(prev, { objectId, field, value })
    )
  }, [])

  const handleAddShape = useCallback((shape) => {
    setEditorProject((prev) => {
      const id = `obj-shape-${Date.now()}`
      const object = buildObject({
        id,
        name: shape?.label ?? 'Shape',
        type: 'shape',
        base: {
          left: 280, top: 300, width: 240, height: 180,
          scaleX: 1, scaleY: 1, angle: 0, opacity: 1,
          fill: '#14b8a6', stroke: '#ffffff', strokeWidth: 2,
          charSpacing: 0, lineHeight: 1, rx: 20, ry: 20,
          'shadow.color': '#000000', 'shadow.opacity': 0.2,
          'shadow.offsetX': 0, 'shadow.offsetY': 10, 'shadow.blur': 24,
        },
      })
      return appendObject(prev, object)
    })
  }, [])

  const handleUploadMedia = useCallback(() => {
    uploadInputRef.current?.click()
  }, [])

  const handleMediaSelected = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    const isAudio = file.type.startsWith('audio/')
    if (!isVideo && !isImage && !isAudio) return
    setEditorProject((prev) => {
      const id = `obj-media-${Date.now()}`
      const object = buildObject({
        id,
        name: file.name,
        type: isVideo ? 'video' : isImage ? 'image' : 'audio',
        source: { url, mimeType: file.type, name: file.name },
        base: {
          left: 260, top: 180, width: isAudio ? 420 : 360, height: isAudio ? 80 : 220,
          scaleX: 1, scaleY: 1, angle: 0, opacity: 1,
          fill: isAudio ? '#1f2937' : '#111827', stroke: '#ffffff', strokeWidth: 1,
          charSpacing: 0, lineHeight: 1, rx: 16, ry: 16,
          'shadow.color': '#000000', 'shadow.opacity': 0.2,
          'shadow.offsetX': 0, 'shadow.offsetY': 8, 'shadow.blur': 16,
        },
      })
      return appendObject(prev, object)
    })
    event.target.value = ''
  }, [])

  // Arrow keys to nudge selected object
  useEffect(() => {
    const onKeyDown = (event) => {
      if (!editorProject.selectedObjectId) return
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) return
      const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']
      if (!arrows.includes(event.key)) return
      event.preventDefault()
      const step = event.shiftKey ? 10 : 1
      const obj = selectedObject
      if (!obj) return
      const left = obj.base?.left ?? 0
      const top = obj.base?.top ?? 0
      const patch =
        event.key === 'ArrowLeft' ? { left: left - step } :
        event.key === 'ArrowRight' ? { left: left + step } :
        event.key === 'ArrowUp' ? { top: top - step } :
        { top: top + step }
      handleObjectMove(editorProject.selectedObjectId, patch, true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editorProject.selectedObjectId, selectedObject, handleObjectMove])

  const handleToggleKeyframe = useCallback(() => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object) return prev
      const propertyId = prev.selectedPropertyId
      const hasKey = hasKeyframeAtTime(object, propertyId, prev.currentTime)
      if (hasKey) {
        setSelectedKeyframes([])
        return removeKeyframe(prev, { objectId: object.id, propertyId, time: prev.currentTime })
      }
      const keyValue = object.base[propertyId] ?? 0
      return upsertKeyframe(prev, { objectId: object.id, propertyId, time: prev.currentTime, value: keyValue })
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
          selectedSet.has(`${prev.selectedPropertyId}:${Number(key.t).toFixed(4)}`)
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
    if (exportAbortRef.current) exportAbortRef.current.abort()
    const abortController = new AbortController()
    exportAbortRef.current = abortController
    setExportState({ status: 'exporting', progress: 0, error: null })
    try {
      const result = await runExportJob({
        project: projectRef.current,
        format,
        resolution,
        signal: abortController.signal,
        onProgress: (progress) =>
          setExportState({ status: 'exporting', progress, error: null }),
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
  }, [])

  useEffect(() => {
    return () => { if (exportAbortRef.current) exportAbortRef.current.abort() }
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
        leftPanel={
          <LeftPanel
            tabs={LEFT_TABS}
            tracks={tracks}
            panelActions={{
              onAddTextPreset: handleAddTextPreset,
              onAddShape: handleAddShape,
              onUploadMedia: handleUploadMedia,
            }}
          />
        }
        rightPanel={
          <RightPanel
            hasSelection={Boolean(selectedObject)}
            selectedObject={selectedObject}
            selectedPropertyId={editorProject.selectedPropertyId}
            onSelectProperty={handlePropertySelect}
            onPropertyChange={handlePropertyChange}
            onToggleKeyframe={handleToggleKeyframe}
            isKeyframedAtCurrentTime={isKeyframedAtCurrentTime}
            onTextStyleChange={handleTextStyleChange}
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
          onMoveObject={handleObjectMove}
          onResizeObject={handleObjectResize}
          onTextContentChange={handleTextContentChange}
          onTextStyleChange={handleTextStyleChange}
        />
      </EditorShell>
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        style={{ display: 'none' }}
        onChange={handleMediaSelected}
      />
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
