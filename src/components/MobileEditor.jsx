import { useState } from 'react'
import CanvasStage from './CanvasStage'
import Timeline from './Timeline'
import AssetsPanel from './AssetsPanel'
import CropPanel from './CropPanel'
import TemplatesPanel from './TemplatesPanel'
import MobilePanels from './MobilePanels'
import OptionsPanel from './OptionsPanel'
import SideMenu from './SideMenu'

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
  onOptionChange,
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

  const panelPosition = activePanel === 'options' ? 'bottom' : 'left'

  return (
    <div className="editor-shell mobile">
      <header className="mobile-header">
        <button
          type="button"
          className="icon-button small"
          onClick={() => togglePanel('menu')}
          aria-label="Open menu"
        >
          <img src="/assets/more-options.svg" alt="" />
        </button>
        <div className="mobile-brand">
          <div className="brand-icon">
            <img src="/assets/zap.svg" alt="" />
          </div>
          <div>
            <div className="mobile-title">VeloMotion</div>
            {buildId && <span className="build-badge">build {buildId}</span>}
          </div>
        </div>
        <button type="button" className="export-button">
          Export
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
        variant="mobile"
      />
      <MobilePanels
        activePanel={activePanel}
        position={panelPosition}
        onClose={() => setActivePanel(null)}
      >
        {activePanel === 'menu' && <SideMenu />}
        {activePanel === 'templates' && (
          <TemplatesPanel onApplyTemplate={onApplyTemplate} compact />
        )}
        {activePanel === 'assets' && <AssetsPanel onAddAsset={onAddAsset} compact />}
        {activePanel === 'options' && (
          <OptionsPanel
            target={cropTarget}
            onApply={onOptionChange}
            onClose={() => setActivePanel(null)}
          />
        )}
      </MobilePanels>
      <nav className="mobile-bottom-nav" aria-label="Quick actions">
        <button
          type="button"
          className={`icon-button ${activePanel === 'templates' ? 'active' : ''}`}
          onClick={() => togglePanel('templates')}
        >
          <img src="/assets/mockup.svg" alt="" />
          <span>Templates</span>
        </button>
        <button type="button" className="add-button" onClick={onAddRect}>
          <img src="/assets/upload.svg" alt="" />
        </button>
        <button
          type="button"
          className={`icon-button ${activePanel === 'assets' ? 'active' : ''}`}
          onClick={() => togglePanel('assets')}
        >
          <img src="/assets/uploads.svg" alt="" />
          <span>Assets</span>
        </button>
        <button
          type="button"
          className={`icon-button ${activePanel === 'options' ? 'active' : ''}`}
          onClick={() => togglePanel('options')}
        >
          <img src="/assets/filters.svg" alt="" />
          <span>Edit</span>
        </button>
      </nav>
    </div>
  )
}

export default MobileEditor
