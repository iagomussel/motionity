import CanvasStage from './CanvasStage'
import Timeline from './Timeline'
import Toolbar from './Toolbar'
import AssetsPanel from './AssetsPanel'

function DesktopEditor({
  objects,
  selectedId,
  onSelect,
  onChange,
  onAddRect,
  onAddText,
  onAddImage,
  onDuplicate,
  onDelete,
  timelineItems,
  duration,
  currentTime,
  isPlaying,
  onPlayToggle,
  onTimeChange,
  onResetTime,
  onAddAsset
}) {
  return (
    <div className="editor-shell">
      <header className="editor-header">
        <div className="brand">
          <span className="brand-accent">Velo</span>Motion
        </div>
        <Toolbar
          onAddRect={onAddRect}
          onAddText={onAddText}
          onAddImage={onAddImage}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </header>
      <main className="editor-main split">
        <AssetsPanel onAddAsset={onAddAsset} />
        <div className="canvas-wrapper">
          <CanvasStage
            objects={objects}
            selectedId={selectedId}
            onSelect={onSelect}
            onChange={onChange}
            onDropAsset={onAddAsset}
          />
        </div>
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
