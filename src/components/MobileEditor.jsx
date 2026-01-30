import CanvasStage from './CanvasStage'
import Timeline from './Timeline'
import AssetsPanel from './AssetsPanel'
import CropPanel from './CropPanel'
import TemplatesPanel from './TemplatesPanel'

function MobileEditor({
  buildId,
  objects,
  selectedId,
  onSelect,
  onChange,
  onAddRect,
  onAddText,
  onAddAsset,
  onCropToggle,
  cropActive,
  cropTarget,
  onCropChange,
  onCloseCrop,
  onApplyTemplate,
  timelineItems,
  duration,
  currentTime,
  isPlaying,
  onPlayToggle,
  onTimeChange,
  onResetTime
}) {
  return (
    <div className="editor-shell mobile">
      <header className="mobile-header">
        <button type="button" className="icon-button" aria-label="Close">
          ✕
        </button>
        <div className="mobile-title">
          Speed
          {buildId && <span className="build-badge">build {buildId}</span>}
        </div>
        <button type="button" className="icon-button primary" aria-label="Confirm">
          ✓
        </button>
      </header>
      <main className="editor-main mobile-main">
        <CanvasStage
          objects={objects}
          selectedId={selectedId}
          onSelect={onSelect}
          onChange={onChange}
          onDropAsset={onAddAsset}
        />
        <CropPanel
          open={cropActive}
          target={cropTarget}
          duration={duration}
          onChange={onCropChange}
          onClose={onCloseCrop}
        />
      </main>
      <TemplatesPanel onApplyTemplate={onApplyTemplate} compact />
      <AssetsPanel onAddAsset={onAddAsset} compact />
      <Timeline
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayToggle={onPlayToggle}
        onTimeChange={onTimeChange}
        onReset={onResetTime}
        items={timelineItems}
        className="timeline-compact"
      />
      <nav className="mobile-bottom-nav" aria-label="Quick actions">
        <button type="button" className="icon-button">🗑</button>
        <button type="button" className="add-button" onClick={onAddRect}>
          +
        </button>
        <button type="button" className="icon-button">⚡</button>
        <button type="button" className="icon-button" onClick={onAddText}>T</button>
      </nav>
    </div>
  )
}

export default MobileEditor
