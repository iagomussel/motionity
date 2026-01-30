import CanvasStage from './CanvasStage'
import Timeline from './Timeline'
import Toolbar from './Toolbar'
import AssetsPanel from './AssetsPanel'
import CropPanel from './CropPanel'

function DesktopEditor({
  buildId,
  objects,
  selectedId,
  onSelect,
  onChange,
  onAddRect,
  onAddText,
  onAddImage,
  onDuplicate,
  onDelete,
  onCropToggle,
  cropActive,
  cropTarget,
  onCropChange,
  onCloseCrop,
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
        {buildId && <span className="build-badge">build {buildId}</span>}
        <Toolbar
          onAddRect={onAddRect}
          onAddText={onAddText}
          onAddImage={onAddImage}
          onCropToggle={onCropToggle}
          cropActive={cropActive}
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
          <CropPanel
            open={cropActive}
            target={cropTarget}
            duration={duration}
            onChange={onCropChange}
            onClose={onCloseCrop}
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
