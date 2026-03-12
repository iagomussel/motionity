import { useState } from 'react'
import styles from './LeftPanel.module.css'

const DEFAULT_TABS = [
  { id: 'media',  icon: '🖼', label: 'Media'  },
  { id: 'text',   icon: 'T',  label: 'Text'   },
  { id: 'shapes', icon: '◻',  label: 'Shapes' },
  { id: 'layers', icon: '⊞',  label: 'Layers' },
]

// Static shape options — hoisted outside component (rendering-hoist-jsx)
const SHAPE_OPTIONS = [
  { id: 'rect',    label: 'Rectangle', path: 'M2 2h20v20H2z' },
  { id: 'circle',  label: 'Circle',    path: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
  { id: 'triangle',label: 'Triangle',  path: 'M12 3 2 21h20z' },
  { id: 'star',    label: 'Star',      path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
]

const TEXT_PRESETS = [
  { id: 'heading',  label: 'Heading',   style: { fontSize: 28, fontWeight: 700 } },
  { id: 'subhead',  label: 'Subheading',style: { fontSize: 20, fontWeight: 600 } },
  { id: 'body',     label: 'Body text', style: { fontSize: 14, fontWeight: 400 } },
  { id: 'caption',  label: 'Caption',   style: { fontSize: 11, fontWeight: 400 } },
]

function MediaPanel() {
  return (
    <div className={styles['panel-inner']}>
      <button className={styles['upload-btn']} aria-label="Upload media">
        <span className={styles['upload-icon']} aria-hidden="true">+</span>
        Upload media
      </button>
      <p className={styles['panel-hint']}>
        Drag &amp; drop images, videos or audio, or click to upload.
      </p>
    </div>
  )
}

function TextPanel() {
  return (
    <div className={styles['panel-inner']}>
      <p className={styles['panel-section-label']}>Text styles</p>
      <ul className={styles['text-presets']} role="list">
        {TEXT_PRESETS.map(p => (
          <li key={p.id}>
            <button
              className={styles['text-preset-btn']}
              style={{ fontSize: p.style.fontSize, fontWeight: p.style.fontWeight }}
              aria-label={`Add ${p.label}`}
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShapesPanel() {
  return (
    <div className={styles['panel-inner']}>
      <p className={styles['panel-section-label']}>Basic shapes</p>
      <div className={styles['shapes-grid']} role="list">
        {SHAPE_OPTIONS.map(s => (
          <button
            key={s.id}
            className={styles['shape-btn']}
            aria-label={`Add ${s.label}`}
            role="listitem"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
              <path d={s.path} />
            </svg>
            <span className={styles['shape-label']}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function LayersPanel({ tracks }) {
  if (tracks.length === 0) {
    return (
      <div className={styles['panel-inner']}>
        <div className={styles['empty-layers']}>
          <span className={styles['empty-layers-icon']} aria-hidden="true">⊞</span>
          <span className={styles['empty-layers-text']}>No layers yet</span>
          <span className={styles['empty-layers-hint']}>Add elements to the canvas to see them here.</span>
        </div>
      </div>
    )
  }
  return (
    <div className={styles['panel-inner']}>
      <ul role="list" className={styles['layers-list']}>
        {tracks.map(t => (
          <li key={t.id} className={styles['layer-item']}>{t.label}</li>
        ))}
      </ul>
    </div>
  )
}

function getPanelContent(tabId, tracks) {
  if (tabId === 'media') return <MediaPanel />
  if (tabId === 'text') return <TextPanel />
  if (tabId === 'shapes') return <ShapesPanel />
  if (tabId === 'layers') return <LayersPanel tracks={tracks} />
  return null
}

/**
 * LeftPanel — collapsible sidebar with tab navigation.
 *
 * @param {Array<{id, icon, label, content}>} tabs
 * @param {string} activeTab  — controlled active tab id
 * @param {Function} onTabChange
 * @param {boolean} collapsed
 * @param {boolean} mobileOpen
 */
export function LeftPanel({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  collapsed = false,
  mobileOpen = false,
  children,
  tracks = [],
}) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id)
  const currentTab = activeTab ?? internalTab

  function handleTabClick(tabId) {
    setInternalTab(tabId)
    onTabChange?.(tabId)
  }

  const panelClasses = [
    styles['left-panel'],
    collapsed ? styles.collapsed : '',
    mobileOpen ? styles['mobile-open'] : '',
  ].filter(Boolean).join(' ')

  return (
    <aside className={panelClasses} aria-label="Editor tools" role="complementary">
      <nav className={styles.tabs} aria-label="Tool panels">
        <div className={styles['tab-row']} role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={currentTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={[
                styles.tab,
                currentTab === tab.id ? styles.active : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <span className={styles['tab-icon']} aria-hidden="true">{tab.icon}</span>
              <span className={styles['tab-label']}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div
        id={`panel-${currentTab}`}
        className={styles.content}
        role="tabpanel"
        aria-label={tabs.find(t => t.id === currentTab)?.label}
      >
        {children ?? getPanelContent(currentTab, tracks) ?? null}
      </div>
    </aside>
  )
}

export default LeftPanel
