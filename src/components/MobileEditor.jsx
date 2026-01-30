import { useState } from 'react'
import CanvasStage from './CanvasStage'
import Timeline from './Timeline'
import AssetsPanel from './AssetsPanel'
import CropPanel from './CropPanel'
import TemplatesPanel from './TemplatesPanel'
import MobilePanels from './MobilePanels'

function MobileEditor({
  buildId,
  objects,
  selectedId,
  onSelect,
  onChange,
  onAddRect,
  onAddAsset,
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
  const [activePanel, setActivePanel] = useState(null)

  const togglePanel = (panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel))
  }

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
      <MobilePanels activePanel={activePanel} onClose={() => setActivePanel(null)}>
        {activePanel === 'templates' && (
          <TemplatesPanel onApplyTemplate={onApplyTemplate} compact />
        )}
        {activePanel === 'assets' && <AssetsPanel onAddAsset={onAddAsset} compact />}
        {activePanel === 'crop' && (
          <CropPanel
            open
            target={cropTarget}
            duration={duration}
            onChange={onCropChange}
            onClose={onCloseCrop}
          />
        )}
      </MobilePanels>
      <nav className="mobile-bottom-nav" aria-label="Quick actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => togglePanel('templates')}
        >
          ✦
        </button>
        <button type="button" className="add-button" onClick={onAddRect}>
          +
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => togglePanel('assets')}
        >
          ▦
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => togglePanel('crop')}
        >
          ⤧
        </button>
      </nav>
    </div>
  )
}

export default MobileEditor
