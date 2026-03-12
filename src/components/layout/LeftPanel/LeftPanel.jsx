import { useState } from 'react'
import styles from './LeftPanel.module.css'

const IconMedia = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.5" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
)

const IconText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4h16v3" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="8" y1="20" x2="16" y2="20" />
  </svg>
)

const IconShapes = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
)

const IconLayers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const TAB_ICONS = { media: IconMedia, text: IconText, shapes: IconShapes, layers: IconLayers }

const DEFAULT_TABS = [
  { id: 'media',  label: 'Media'  },
  { id: 'text',   label: 'Text'   },
  { id: 'shapes', label: 'Shapes' },
  { id: 'layers', label: 'Layers' },
]

const SHAPE_OPTIONS = [
  { id: 'rect',    label: 'Rectangle', path: 'M2 2h20v20H2z' },
  { id: 'circle',  label: 'Circle',    path: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
  { id: 'triangle',label: 'Triangle',  path: 'M12 3 2 21h20z' },
  { id: 'star',    label: 'Star',      path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
]

const TEXT_PRESETS = [
  {
    id: 'add-text',
    label: 'Add a text box',
    defaultText: 'Your text here',
    textStyle: { fontFamily: 'Inter, sans-serif', fontSize: 36, fontWeight: 400, textAlign: 'center', color: '#ffffff' },
    preview: { fontSize: 14, fontWeight: 400 },
  },
  {
    id: 'heading',
    label: 'Add a heading',
    defaultText: 'Heading',
    textStyle: { fontFamily: 'Inter, sans-serif', fontSize: 72, fontWeight: 800, textAlign: 'center', color: '#ffffff' },
    preview: { fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' },
  },
  {
    id: 'subhead',
    label: 'Add a subheading',
    defaultText: 'Subheading',
    textStyle: { fontFamily: 'Inter, sans-serif', fontSize: 48, fontWeight: 600, textAlign: 'center', color: '#ffffff' },
    preview: { fontSize: 17, fontWeight: 600 },
  },
  {
    id: 'body',
    label: 'Add body text',
    defaultText: 'Body text goes here. Edit this to tell your story.',
    textStyle: { fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 400, textAlign: 'left', color: '#ffffff' },
    preview: { fontSize: 13, fontWeight: 400 },
  },
  {
    id: 'caption',
    label: 'Add a caption',
    defaultText: 'Caption',
    textStyle: { fontFamily: 'Inter, sans-serif', fontSize: 18, fontWeight: 400, textAlign: 'center', color: '#cccccc' },
    preview: { fontSize: 11, fontWeight: 400, fontStyle: 'italic' },
  },
  {
    id: 'title-bold',
    label: 'Bold Title',
    defaultText: 'BOLD TITLE',
    textStyle: { fontFamily: 'Space Grotesk, sans-serif', fontSize: 80, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 4, color: '#ffffff' },
    preview: { fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '3px', textTransform: 'uppercase' },
  },
  {
    id: 'serif-elegant',
    label: 'Elegant Serif',
    defaultText: 'Elegant Serif',
    textStyle: { fontFamily: 'Georgia, serif', fontSize: 56, fontWeight: 400, fontStyle: 'italic', textAlign: 'center', color: '#f0e6d3' },
    preview: { fontSize: 17, fontWeight: 400, fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#c8b89a' },
  },
  {
    id: 'mono-code',
    label: 'Monospace',
    defaultText: 'console.log("hello")',
    textStyle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 400, textAlign: 'left', color: '#4ade80' },
    preview: { fontSize: 12, fontWeight: 400, fontFamily: 'JetBrains Mono, monospace', color: '#4ade80' },
  },
]

function MediaPanel({ onUploadMedia }) {
  return (
    <div className={styles['panel-inner']}>
      <button className={styles['upload-btn']} aria-label="Upload media" onClick={() => onUploadMedia?.()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-400)' }}>
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Upload media
      </button>
      <p className={styles['panel-hint']}>
        Drag &amp; drop images, videos or audio, or click to upload.
      </p>
    </div>
  )
}

function TextPanel({ onAddTextPreset }) {
  return (
    <div className={styles['panel-inner']}>
      <p className={styles['panel-section-label']}>Click to add to canvas</p>
      <ul className={styles['text-presets']} role="list">
        {TEXT_PRESETS.map(p => (
          <li key={p.id}>
            <button
              className={styles['text-preset-btn']}
              style={{
                fontSize: p.preview?.fontSize ?? 14,
                fontWeight: p.preview?.fontWeight ?? 400,
                fontFamily: p.preview?.fontFamily ?? 'Inter, sans-serif',
                fontStyle: p.preview?.fontStyle ?? 'normal',
                letterSpacing: p.preview?.letterSpacing ?? 'normal',
                textTransform: p.preview?.textTransform ?? 'none',
                color: p.preview?.color ?? 'var(--color-text-primary)',
                padding: '10px 14px',
                textAlign: 'left',
                lineHeight: 1.4,
              }}
              aria-label={`Add ${p.label}`}
              onClick={() => onAddTextPreset?.(p)}
            >
              {p.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ShapesPanel({ onAddShape }) {
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
            onClick={() => onAddShape?.(s)}
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
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

function getPanelContent(tabId, tracks, panelActions) {
  if (tabId === 'media') return <MediaPanel onUploadMedia={panelActions.onUploadMedia} />
  if (tabId === 'text') return <TextPanel onAddTextPreset={panelActions.onAddTextPreset} />
  if (tabId === 'shapes') return <ShapesPanel onAddShape={panelActions.onAddShape} />
  if (tabId === 'layers') return <LayersPanel tracks={tracks} />
  return null
}

export function LeftPanel({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  collapsed = false,
  mobileOpen = false,
  children,
  tracks = [],
  panelActions = {},
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
          {tabs.map(tab => {
            const Icon = TAB_ICONS[tab.id]
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={currentTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                className={[styles.tab, currentTab === tab.id ? styles.active : ''].filter(Boolean).join(' ')}
                onClick={() => handleTabClick(tab.id)}
                title={tab.label}
              >
                <span className={styles['tab-icon']} aria-hidden="true">
                  {Icon ? <Icon /> : null}
                </span>
                <span className={styles['tab-label']}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div
        id={`panel-${currentTab}`}
        className={styles.content}
        role="tabpanel"
        aria-label={tabs.find(t => t.id === currentTab)?.label}
      >
        {children ?? getPanelContent(currentTab, tracks, panelActions) ?? null}
      </div>
    </aside>
  )
}

export default LeftPanel
