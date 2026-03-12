import { useState } from 'react'
import styles from './LeftPanel.module.css'

// ---------------------------------------------------------------------------
// SVG Icons (Lucide-style, no emojis)
// ---------------------------------------------------------------------------

const IconMedia = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.5" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
  </svg>
)
const IconText = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4h16v3" /><line x1="12" y1="4" x2="12" y2="20" /><line x1="8" y1="20" x2="16" y2="20" />
  </svg>
)
const IconShapes = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
)
const IconLayers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
)

const TAB_ICONS = { media: IconMedia, text: IconText, shapes: IconShapes, layers: IconLayers }

const DEFAULT_TABS = [
  { id: 'media',  label: 'Media'  },
  { id: 'text',   label: 'Text'   },
  { id: 'shapes', label: 'Shapes' },
  { id: 'layers', label: 'Layers' },
]

// ---------------------------------------------------------------------------
// Small SVG icons for layer actions
// ---------------------------------------------------------------------------

const IconEye = ({ off }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: off ? 0.3 : 1 }}>
    {off ? <><line x1="1" y1="1" x2="23" y2="23" /><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>}
  </svg>
)
const IconLock = ({ locked }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: locked ? 1 : 0.3 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    {locked ? <path d="M7 11V7a5 5 0 0 1 10 0v4" /> : <path d="M7 11V7a5 5 0 0 1 9.9-1" />}
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const IconChevronUp = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)
const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const TYPE_LABELS = { text: 'T', shape: 'S', image: 'I', video: 'V', audio: 'A' }
const TYPE_COLORS = { text: '#a78bfa', shape: '#14b8a6', image: '#f59e0b', video: '#ec4899', audio: '#3b82f6' }

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

const SHAPE_OPTIONS = [
  { id: 'rect',    label: 'Rectangle', path: 'M2 2h20v20H2z' },
  { id: 'circle',  label: 'Circle',    path: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z' },
  { id: 'triangle',label: 'Triangle',  path: 'M12 3 2 21h20z' },
  { id: 'star',    label: 'Star',      path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z' },
  { id: 'polygon', label: 'Hexagon',   path: 'M12 2l8.66 5v10L12 22l-8.66-5V7z' },
]

// ---------------------------------------------------------------------------
// Text presets
// ---------------------------------------------------------------------------

const TEXT_PRESETS = [
  { id: 'add-text', label: 'Add a text box', defaultText: 'Your text here', textStyle: { fontSize: 36, fontWeight: 400, textAlign: 'center', color: '#ffffff' }, preview: { fontSize: 14, fontWeight: 400 } },
  { id: 'heading', label: 'Add a heading', defaultText: 'Heading', textStyle: { fontSize: 72, fontWeight: 800, textAlign: 'center', color: '#ffffff' }, preview: { fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' } },
  { id: 'subhead', label: 'Add a subheading', defaultText: 'Subheading', textStyle: { fontSize: 48, fontWeight: 600, textAlign: 'center', color: '#ffffff' }, preview: { fontSize: 17, fontWeight: 600 } },
  { id: 'body', label: 'Add body text', defaultText: 'Body text here.', textStyle: { fontSize: 24, fontWeight: 400, textAlign: 'left', color: '#ffffff' }, preview: { fontSize: 13, fontWeight: 400 } },
  { id: 'title-bold', label: 'Bold Title', defaultText: 'BOLD TITLE', textStyle: { fontFamily: 'Space Grotesk, sans-serif', fontSize: 80, fontWeight: 700, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 4, color: '#ffffff' }, preview: { fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '3px', textTransform: 'uppercase' } },
  { id: 'mono-code', label: 'Monospace', defaultText: 'console.log("hello")', textStyle: { fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 400, textAlign: 'left', color: '#4ade80' }, preview: { fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#4ade80' } },
]

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

function MediaPanel({ onUploadMedia }) {
  return (
    <div className={styles['panel-inner']}>
      <button className={styles['upload-btn']} aria-label="Upload media" onClick={() => onUploadMedia?.()}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-brand-400)' }}>
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Upload media
      </button>
      <p className={styles['panel-hint']}>Drop images, videos or audio, or click to upload.</p>
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
              }}
              onClick={() => onAddTextPreset?.(p)}
            >{p.label}</button>
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
          <button key={s.id} className={styles['shape-btn']} aria-label={`Add ${s.label}`} onClick={() => onAddShape?.(s)}>
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d={s.path} /></svg>
            <span className={styles['shape-label']}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function LayersPanel({ objects = [], selectedObjectId, layerActions = {} }) {
  if (objects.length === 0) {
    return (
      <div className={styles['panel-inner']}>
        <div className={styles['empty-layers']}>
          <IconLayers />
          <span className={styles['empty-layers-text']}>No layers yet</span>
          <span className={styles['empty-layers-hint']}>Add elements to the canvas to see them here.</span>
        </div>
      </div>
    )
  }

  const reversed = [...objects].reverse()

  return (
    <div className={styles['panel-inner']} style={{ padding: 0 }}>
      <ul role="list" className={styles['layers-list']}>
        {reversed.map((obj) => {
          const isSelected = obj.id === selectedObjectId
          return (
            <li
              key={obj.id}
              className={[styles['layer-item'], isSelected ? styles['layer-selected'] : ''].filter(Boolean).join(' ')}
              onClick={() => layerActions.onSelect?.(obj.id)}
            >
              <span className={styles['layer-type']} style={{ color: TYPE_COLORS[obj.type] || '#888' }}>
                {TYPE_LABELS[obj.type] || '?'}
              </span>
              <span className={styles['layer-name']}>{obj.name}</span>
              <span className={styles['layer-actions']}>
                <button title="Toggle visibility" onClick={(e) => { e.stopPropagation(); layerActions.onToggleVisibility?.(obj.id) }}><IconEye off={obj.hidden} /></button>
                <button title="Toggle lock" onClick={(e) => { e.stopPropagation(); layerActions.onToggleLock?.(obj.id) }}><IconLock locked={obj.locked} /></button>
                <button title="Move up" onClick={(e) => { e.stopPropagation(); layerActions.onMoveUp?.(obj.id) }}><IconChevronUp /></button>
                <button title="Move down" onClick={(e) => { e.stopPropagation(); layerActions.onMoveDown?.(obj.id) }}><IconChevronDown /></button>
                <button title="Duplicate" onClick={(e) => { e.stopPropagation(); layerActions.onDuplicate?.(obj.id) }}><IconCopy /></button>
                <button title="Delete" onClick={(e) => { e.stopPropagation(); layerActions.onDelete?.(obj.id) }} className={styles['layer-delete']}><IconTrash /></button>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function getPanelContent(tabId, panelActions, objects, selectedObjectId, layerActions) {
  if (tabId === 'media') return <MediaPanel onUploadMedia={panelActions.onUploadMedia} />
  if (tabId === 'text') return <TextPanel onAddTextPreset={panelActions.onAddTextPreset} />
  if (tabId === 'shapes') return <ShapesPanel onAddShape={panelActions.onAddShape} />
  if (tabId === 'layers') return <LayersPanel objects={objects} selectedObjectId={selectedObjectId} layerActions={layerActions} />
  return null
}

// ---------------------------------------------------------------------------
// LeftPanel
// ---------------------------------------------------------------------------

export function LeftPanel({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  collapsed = false,
  mobileOpen = false,
  children,
  objects = [],
  selectedObjectId = null,
  layerActions = {},
  panelActions = {},
}) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id)
  const currentTab = activeTab ?? internalTab

  function handleTabClick(tabId) {
    setInternalTab(tabId)
    onTabChange?.(tabId)
  }

  const panelClasses = [styles['left-panel'], collapsed ? styles.collapsed : '', mobileOpen ? styles['mobile-open'] : ''].filter(Boolean).join(' ')

  return (
    <aside className={panelClasses} aria-label="Editor tools" role="complementary">
      <nav className={styles.tabs} aria-label="Tool panels">
        <div className={styles['tab-row']} role="tablist">
          {tabs.map(tab => {
            const Icon = TAB_ICONS[tab.id]
            return (
              <button
                key={tab.id} role="tab" aria-selected={currentTab === tab.id}
                className={[styles.tab, currentTab === tab.id ? styles.active : ''].filter(Boolean).join(' ')}
                onClick={() => handleTabClick(tab.id)} title={tab.label}
              >
                <span className={styles['tab-icon']}>{Icon ? <Icon /> : null}</span>
                <span className={styles['tab-label']}>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      <div id={`panel-${currentTab}`} className={styles.content} role="tabpanel">
        {children ?? getPanelContent(currentTab, panelActions, objects, selectedObjectId, layerActions) ?? null}
      </div>
    </aside>
  )
}

export default LeftPanel
