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
import { ShortcutsOverlay } from './components/ui/ShortcutsOverlay/ShortcutsOverlay'
import GlobalErrorOverlay from './errorHandling/GlobalErrorOverlay.jsx'

import { useEditorHistory } from './hooks/useEditorHistory.js'
import { usePlayback } from './hooks/usePlayback.js'
import { useAutoSave } from './hooks/useAutoSave.js'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.js'

import {
  appendObject, removeObject, duplicateObject,
  bringToFront, sendToBack, moveObjectUp, moveObjectDown,
  toggleObjectVisibility, toggleObjectLock, renameObject,
  deleteKeyframesByTimes, getRenderedObjectsAtTime, getSelectedObject,
  removeKeyframe, replaceKeyframes, selectObject, selectProperty,
  setCurrentTime, togglePlayback, upsertKeyframe,
  updateObjectBaseProperty, updateObjectBaseProperties, updateObjectTextField,
  updateObjectVisibleRange, slideObjectInTime, updateObjectMedia,
  setProjectDuration, setPlaybackSpeed, splitObjectAtTime,
  setAspectRatio, ASPECT_RATIOS,
  updateObjectFilter, applyFilterPreset, applyTextAnimationPreset,
} from './project/editorState.js'
import { hasKeyframeAtTime, EASING_OPTIONS } from './project/animationEngine.js'
import { runExportJob, triggerBrowserDownload } from './project/exportService.js'
import { listAnimatablePropertyIds, FILTER_PRESETS } from './project/propertyRegistry.js'

function makeEmptyKeyframes() {
  const kf = {}
  for (const id of listAnimatablePropertyIds()) kf[id] = []
  return kf
}

const FILTER_DEFAULTS = {
  'filter.brightness': 100, 'filter.contrast': 100, 'filter.saturate': 100,
  'filter.blur': 0, 'filter.grayscale': 0, 'filter.sepia': 0,
  'filter.hueRotate': 0, 'filter.invert': 0,
}

function buildObject({ id, name, type, base, textContent = '', textStyle = null, source = null, shapeId = null }) {
  return {
    id, name, type, shapeId,
    trackId: 'track-video-main',
    clipId: 'clip-video-main',
    base: { ...FILTER_DEFAULTS, ...base },
    textContent, textStyle, source,
    hidden: false, locked: false,
    keyframes: makeEmptyKeyframes(),
    visibleRange: { start: 0, end: 15 },
  }
}

function applyPatchWithOptionalKeyframes(prev, objectId, patch, commit) {
  let next = updateObjectBaseProperties(prev, { objectId, patch })
  if (!commit) return next
  for (const [key, val] of Object.entries(patch)) {
    next = upsertKeyframe(next, { objectId, propertyId: key, time: next.currentTime, value: val })
  }
  return next
}

function App() {
  // --- Extracted hooks ---
  const {
    editorProject, canUndo: canUndoNow, canRedo: canRedoNow,
    setEditorProject, setProjectDirect, handleUndo, handleRedo,
  } = useEditorHistory()

  const isPlaying = editorProject.playback.isPlaying
  const currentTime = editorProject.currentTime
  const duration = editorProject.duration
  const projectName = editorProject.name

  const playbackControls = usePlayback({ isPlaying, setProjectDirect })
  const projectRef = useAutoSave(editorProject)

  // --- UI State ---
  const [saveStatus, setSaveStatus] = useState('idle')
  const [activeTool, setActiveTool] = useState('select')
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [exportState, setExportState] = useState({ status: 'idle', progress: 0, error: null })
  const exportAbortRef = useRef(null)
  const [selectedKeyframes, setSelectedKeyframes] = useState([])
  const uploadInputRef = useRef(null)

  // --- Derived state ---
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

  // --- Split clip handler ---
  const handleSplitClip = useCallback(() => {
    if (editorProject.selectedObjectId) {
      setEditorProject((prev) => splitObjectAtTime(prev, prev.selectedObjectId, prev.currentTime))
    }
  }, [editorProject.selectedObjectId, setEditorProject])

  // --- Keyboard shortcuts (with overlay) ---
  const { showShortcuts, setShowShortcuts } = useKeyboardShortcuts({
    editorProject,
    selectedObject,
    setEditorProject,
    setProjectDirect,
    handleUndo,
    handleRedo,
    onSaveStatus: setSaveStatus,
    projectRef,
    onSplitClip: handleSplitClip,
    onStepBackward: playbackControls.stepBackward,
    onStepForward: playbackControls.stepForward,
    onSkipStart: playbackControls.skipStart,
    onSkipEnd: playbackControls.skipEnd,
  })

  // --- Handlers ---
  const handleProjectNameChange = useCallback((name) => {
    setEditorProject((prev) => ({ ...prev, name, updatedAt: new Date().toISOString() }))
  }, [setEditorProject])

  const handleExport = useCallback(() => setExportModalOpen(true), [])
  const handleShare = useCallback(() => setShareModalOpen(true), [])

  const handleObjectSelect = useCallback((id) => { setProjectDirect((p) => selectObject(p, id)); setSelectedKeyframes([]) }, [setProjectDirect])
  const handlePropertySelect = useCallback((id) => { setProjectDirect((p) => selectProperty(p, id)); setSelectedKeyframes([]) }, [setProjectDirect])

  const handlePropertyChange = useCallback((propertyId, value) => {
    setEditorProject((prev) => {
      const objectId = prev.selectedObjectId
      if (!objectId) return prev
      let next = updateObjectBaseProperty(prev, { objectId, propertyId, value })
      return upsertKeyframe(next, { objectId, propertyId, time: next.currentTime, value })
    })
  }, [setEditorProject])

  const handleObjectMove = useCallback((objectId, patch, commit = false) => {
    const fn = commit ? setEditorProject : setProjectDirect
    fn((prev) => applyPatchWithOptionalKeyframes(prev, objectId, patch, commit))
  }, [setEditorProject, setProjectDirect])

  const handleObjectResize = useCallback((objectId, patch, commit = false) => {
    const fn = commit ? setEditorProject : setProjectDirect
    fn((prev) => applyPatchWithOptionalKeyframes(prev, objectId, patch, commit))
  }, [setEditorProject, setProjectDirect])

  const handleObjectRotate = useCallback((objectId, angle, commit = false) => {
    const fn = commit ? setEditorProject : setProjectDirect
    fn((prev) => applyPatchWithOptionalKeyframes(prev, objectId, { angle }, commit))
  }, [setEditorProject, setProjectDirect])

  const handleAddTextPreset = useCallback((preset) => {
    setEditorProject((prev) => {
      const id = `obj-text-${Date.now()}`
      const s = preset?.textStyle ?? {}
      const fs = s.fontSize ?? 48
      return appendObject(prev, buildObject({
        id, name: preset?.label ?? 'Text', type: 'text',
        textContent: preset?.defaultText ?? preset?.label ?? 'Your text here',
        textStyle: {
          fontFamily: s.fontFamily ?? 'Inter, sans-serif', fontSize: fs,
          fontWeight: s.fontWeight ?? 400, fontStyle: s.fontStyle ?? 'normal',
          textDecoration: s.textDecoration ?? 'none', textAlign: s.textAlign ?? 'center',
          textTransform: s.textTransform ?? 'none', lineHeight: s.lineHeight ?? 1.3,
          letterSpacing: s.letterSpacing ?? 0, textBackground: s.textBackground ?? 'transparent',
        },
        base: {
          left: 280, top: 240, width: 520, height: Math.ceil(fs * 1.4) + 16,
          scaleX: 1, scaleY: 1, angle: 0, opacity: 1,
          fill: s.color ?? '#ffffff', stroke: '#000000', strokeWidth: 0,
          charSpacing: 0, lineHeight: 1.3, rx: 0, ry: 0,
          'shadow.color': '#000000', 'shadow.opacity': 0,
          'shadow.offsetX': 0, 'shadow.offsetY': 0, 'shadow.blur': 0,
        },
      }))
    })
  }, [setEditorProject])

  const handleTextContentChange = useCallback((objectId, text) => {
    setEditorProject((p) => updateObjectTextField(p, { objectId, field: 'textContent', value: text }))
  }, [setEditorProject])

  const handleTextStyleChange = useCallback((objectId, field, value) => {
    setEditorProject((p) => updateObjectTextField(p, { objectId, field, value }))
  }, [setEditorProject])

  const handleAddShape = useCallback((shape) => {
    const isCircle = shape?.id === 'circle'
    const size = isCircle ? 200 : 240
    setEditorProject((prev) => appendObject(prev, buildObject({
      id: `obj-shape-${Date.now()}`, name: shape?.label ?? 'Shape', type: 'shape',
      shapeId: shape?.id ?? 'rect',
      base: {
        left: 280, top: 300, width: size, height: isCircle ? size : 180,
        scaleX: 1, scaleY: 1, angle: 0, opacity: 1,
        fill: '#14b8a6', stroke: '#ffffff', strokeWidth: 2,
        charSpacing: 0, lineHeight: 1, rx: 0, ry: 0,
        'shadow.color': '#000000', 'shadow.opacity': 0.2,
        'shadow.offsetX': 0, 'shadow.offsetY': 10, 'shadow.blur': 24,
      },
    })))
  }, [setEditorProject])

  const handleUploadMedia = useCallback(() => uploadInputRef.current?.click(), [])

  const handleMediaSelected = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const t = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : null
    if (!t) return
    const isAudio = t === 'audio'
    setEditorProject((prev) => appendObject(prev, buildObject({
      id: `obj-media-${Date.now()}`, name: file.name, type: t,
      source: { url, mimeType: file.type, name: file.name },
      base: {
        left: 260, top: 180, width: isAudio ? 420 : 360, height: isAudio ? 80 : 220,
        scaleX: 1, scaleY: 1, angle: 0, opacity: 1,
        fill: isAudio ? '#1f2937' : '#111827', stroke: '#ffffff', strokeWidth: 1,
        charSpacing: 0, lineHeight: 1, rx: 16, ry: 16,
        'shadow.color': '#000000', 'shadow.opacity': 0.2,
        'shadow.offsetX': 0, 'shadow.offsetY': 8, 'shadow.blur': 16,
      },
    })))
    event.target.value = ''
  }, [setEditorProject])

  // --- Layer actions ---
  const handleDeleteObject = useCallback((id) => setEditorProject((p) => removeObject(p, id)), [setEditorProject])
  const handleDuplicateObject = useCallback((id) => setEditorProject((p) => duplicateObject(p, id)), [setEditorProject])
  const handleBringToFront = useCallback((id) => setEditorProject((p) => bringToFront(p, id)), [setEditorProject])
  const handleSendToBack = useCallback((id) => setEditorProject((p) => sendToBack(p, id)), [setEditorProject])
  const handleMoveObjectUp = useCallback((id) => setEditorProject((p) => moveObjectUp(p, id)), [setEditorProject])
  const handleMoveObjectDown = useCallback((id) => setEditorProject((p) => moveObjectDown(p, id)), [setEditorProject])
  const handleToggleVisibility = useCallback((id) => setEditorProject((p) => toggleObjectVisibility(p, id)), [setEditorProject])
  const handleToggleLock = useCallback((id) => setEditorProject((p) => toggleObjectLock(p, id)), [setEditorProject])
  const handleRenameObject = useCallback((id, name) => setEditorProject((p) => renameObject(p, id, name)), [setEditorProject])

  // --- Clip / trim handlers ---
  const handleTrimObject = useCallback((objectId, start, end) => {
    setEditorProject((p) => updateObjectVisibleRange(p, objectId, start, end))
  }, [setEditorProject])

  const handleSlideObject = useCallback((objectId, deltaTime, commit = false) => {
    const fn = commit ? setEditorProject : setProjectDirect
    fn((p) => slideObjectInTime(p, objectId, deltaTime))
  }, [setEditorProject, setProjectDirect])

  // --- Media property handlers ---
  const handleMediaPropertyChange = useCallback((objectId, field, value) => {
    setEditorProject((p) => updateObjectMedia(p, objectId, field, value))
  }, [setEditorProject])

  // --- Project settings ---
  const handleDurationChange = useCallback((d) => {
    setEditorProject((p) => setProjectDuration(p, d))
  }, [setEditorProject])

  const handleSpeedChange = useCallback((s) => {
    setProjectDirect((p) => setPlaybackSpeed(p, s))
  }, [setProjectDirect])

  const handleAspectRatioChange = useCallback((ratioId) => {
    setEditorProject((p) => setAspectRatio(p, ratioId))
  }, [setEditorProject])

  // --- Filter preset handler ---
  const handleApplyFilterPreset = useCallback((objectId, presetValues) => {
    setEditorProject((p) => applyFilterPreset(p, objectId, presetValues))
  }, [setEditorProject])

  // --- Text animation handler ---
  const handleApplyTextAnimation = useCallback((objectId, presetFn) => {
    setEditorProject((p) => applyTextAnimationPreset(p, objectId, presetFn))
  }, [setEditorProject])

  // --- Keyframe easing handler ---
  const handleSetKeyframeEasing = useCallback((easingId) => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object) return prev
      const propId = prev.selectedPropertyId
      const keys = (object.keyframes[propId] ?? []).map((k) => {
        if (selectedKeyframes.includes(`${propId}:${Number(k.t).toFixed(4)}`)) {
          return { ...k, easing: easingId }
        }
        return k
      })
      return replaceKeyframes(prev, { objectId: object.id, propertyId: propId, keyframes: keys })
    })
  }, [selectedKeyframes, setEditorProject])

  // --- Keyframe handlers ---
  const handleToggleKeyframe = useCallback(() => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object) return prev
      const propertyId = prev.selectedPropertyId
      if (hasKeyframeAtTime(object, propertyId, prev.currentTime)) {
        setSelectedKeyframes([])
        return removeKeyframe(prev, { objectId: object.id, propertyId, time: prev.currentTime })
      }
      return upsertKeyframe(prev, { objectId: object.id, propertyId, time: prev.currentTime, value: object.base[propertyId] ?? 0 })
    })
  }, [setEditorProject])

  const handleUpdateKeyframeTimes = useCallback((nextKeys) => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object) return prev
      return replaceKeyframes(prev, { objectId: object.id, propertyId: prev.selectedPropertyId, keyframes: nextKeys })
    })
  }, [setEditorProject])

  const handleDeleteKeyframes = useCallback(() => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object || selectedKeyframes.length === 0) return prev
      const times = selectedKeyframes.map((id) => Number(String(id).split(':')[1])).filter((t) => Number.isFinite(t))
      return deleteKeyframesByTimes(prev, { objectId: object.id, propertyId: prev.selectedPropertyId, times })
    })
    setSelectedKeyframes([])
  }, [selectedKeyframes, setEditorProject])

  const handleDuplicateKeyframes = useCallback(() => {
    setEditorProject((prev) => {
      const object = getSelectedObject(prev)
      if (!object || selectedKeyframes.length === 0) return prev
      const dt = 1 / Math.max(1, prev.playback.fps)
      const lane = object.keyframes[prev.selectedPropertyId] ?? []
      const selectedSet = new Set(selectedKeyframes)
      const dupes = lane
        .filter((k) => selectedSet.has(`${prev.selectedPropertyId}:${Number(k.t).toFixed(4)}`))
        .map((k) => ({ t: Math.min(prev.duration, k.t + dt), value: k.value, easing: k.easing }))
      return replaceKeyframes(prev, { objectId: object.id, propertyId: prev.selectedPropertyId, keyframes: [...lane, ...dupes] })
    })
  }, [selectedKeyframes, setEditorProject])

  // --- Export ---
  const handleExportRun = useCallback(async ({ format, resolution }) => {
    if (exportAbortRef.current) exportAbortRef.current.abort()
    const ac = new AbortController()
    exportAbortRef.current = ac
    setExportState({ status: 'exporting', progress: 0, error: null })
    try {
      const result = await runExportJob({
        project: projectRef.current,
        format,
        resolution,
        signal: ac.signal,
        onProgress: (p) => setExportState({ status: 'exporting', progress: p, error: null }),
      })
      triggerBrowserDownload(result)
      setExportState({ status: 'done', progress: 100, error: null })
    } catch (err) {
      setExportState({ status: 'error', progress: 0, error: err instanceof Error ? err.message : 'Export failed' })
    }
  }, [projectRef])

  useEffect(() => () => { if (exportAbortRef.current) exportAbortRef.current.abort() }, [])

  const layerActions = useMemo(() => ({
    onSelect: handleObjectSelect,
    onDelete: handleDeleteObject,
    onDuplicate: handleDuplicateObject,
    onBringToFront: handleBringToFront,
    onSendToBack: handleSendToBack,
    onMoveUp: handleMoveObjectUp,
    onMoveDown: handleMoveObjectDown,
    onToggleVisibility: handleToggleVisibility,
    onToggleLock: handleToggleLock,
    onRename: handleRenameObject,
  }), [handleObjectSelect, handleDeleteObject, handleDuplicateObject, handleBringToFront, handleSendToBack, handleMoveObjectUp, handleMoveObjectDown, handleToggleVisibility, handleToggleLock, handleRenameObject])

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
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndoNow}
            canRedo={canRedoNow}
            aspectRatio={editorProject.aspectRatio}
            aspectRatios={ASPECT_RATIOS}
            onAspectRatioChange={handleAspectRatioChange}
          />
        }
        leftPanel={
          <LeftPanel
            objects={editorProject.objects}
            selectedObjectId={editorProject.selectedObjectId}
            layerActions={layerActions}
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
            onDelete={handleDeleteObject}
            onDuplicate={handleDuplicateObject}
            onMediaPropertyChange={handleMediaPropertyChange}
            onTrimObject={handleTrimObject}
            projectDuration={duration}
            filterPresets={FILTER_PRESETS}
            onApplyFilterPreset={handleApplyFilterPreset}
            easingOptions={EASING_OPTIONS}
            selectedKeyframes={selectedKeyframes}
            onSetKeyframeEasing={handleSetKeyframeEasing}
            onApplyTextAnimation={handleApplyTextAnimation}
          />
        }
        timeline={
          <Timeline
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            objects={editorProject.objects}
            selectedObjectId={editorProject.selectedObjectId}
            onSelectObject={handleObjectSelect}
            onTrimObject={handleTrimObject}
            onSlideObject={handleSlideObject}
            onSplitObject={handleSplitClip}
            onPlay={playbackControls.play}
            onPause={playbackControls.pause}
            onSkipToStart={playbackControls.skipStart}
            onSkipToEnd={playbackControls.skipEnd}
            onSeek={playbackControls.seek}
            selectedObject={selectedObject}
            selectedPropertyId={editorProject.selectedPropertyId}
            onSelectProperty={handlePropertySelect}
            onToggleKeyframe={handleToggleKeyframe}
            zoom={editorProject.playback.zoom}
            onZoomIn={playbackControls.zoomIn}
            onZoomOut={playbackControls.zoomOut}
            fps={editorProject.playback.fps}
            speed={editorProject.playback.speed ?? 1}
            onSpeedChange={handleSpeedChange}
            onDurationChange={handleDurationChange}
            selectedKeyframes={selectedKeyframes}
            onSelectedKeyframesChange={setSelectedKeyframes}
            onUpdateKeyframeTimes={handleUpdateKeyframeTimes}
            onDeleteKeyframes={handleDeleteKeyframes}
            onDuplicateKeyframes={handleDuplicateKeyframes}
            onStepBackward={playbackControls.stepBackward}
            onStepForward={playbackControls.stepForward}
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
          onRotateObject={handleObjectRotate}
          onTextContentChange={handleTextContentChange}
          onTextStyleChange={handleTextStyleChange}
          isPlaying={isPlaying}
          currentTime={currentTime}
          canvasWidth={editorProject.canvasWidth ?? 1920}
          canvasHeight={editorProject.canvasHeight ?? 1080}
        />
      </EditorShell>
      <input ref={uploadInputRef} type="file" accept="image/*,video/*,audio/*" style={{ display: 'none' }} onChange={handleMediaSelected} />
      <SaveToast status={saveStatus} />
      <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} onExport={handleExportRun} exportState={exportState} />
      <ShareModal open={shareModalOpen} onClose={() => setShareModalOpen(false)} projectName={projectName} project={editorProject} />
      <ShortcutsOverlay open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  )
}

export default App
