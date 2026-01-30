import CanvasStage from './CanvasStage'
import Timeline from './Timeline'

function DesktopEditor({
  objects,
  selectedId,
  onSelect,
  onChange,
  onAddRect,
  onAddText,
  timelineItems,
  duration,
  currentTime,
  isPlaying,
  onPlayToggle,
  onTimeChange,
  onResetTime
}) {
  return (
    <div className="editor-shell">
      <header className="editor-header">
        <div className="brand">
          <span className="brand-accent">Velo</span>Motion
        </div>
        <div className="editor-actions">
          <button type="button" onClick={onAddRect}>
            Add Rect
          </button>
          <button type="button" onClick={onAddText}>
            Add Text
          </button>
        </div>
      </header>
      <main className="editor-main">
        <CanvasStage
          objects={objects}
          selectedId={selectedId}
          onSelect={onSelect}
          onChange={onChange}
        />
      </main>
      <Timeline
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayToggle={onPlayToggle}
        onTimeChange={onTimeChange}
        onReset={onResetTime}
        items={timelineItems}
      />
    </div>
  )
}

export default DesktopEditor
