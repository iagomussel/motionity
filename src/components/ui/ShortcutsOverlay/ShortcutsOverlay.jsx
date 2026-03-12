import { useEffect, useCallback } from 'react'
import { SHORTCUT_MAP } from '../../../hooks/useKeyboardShortcuts.js'

const overlayStyle = {
  position: 'fixed', inset: 0, zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
}

const panelStyle = {
  background: '#1a1a2e', borderRadius: 16, padding: '32px 40px',
  minWidth: 480, maxWidth: 600, maxHeight: '80vh', overflowY: 'auto',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
}

const headingStyle = {
  fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '0 0 20px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
}

const categoryStyle = {
  fontSize: 11, fontWeight: 600, color: '#7c3aed',
  textTransform: 'uppercase', letterSpacing: '0.08em',
  margin: '16px 0 8px', paddingBottom: 4,
  borderBottom: '1px solid rgba(124,58,237,0.2)',
}

const rowStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '6px 0', color: '#94a3b8', fontSize: 13,
}

const kbdStyle = {
  display: 'inline-block', background: '#0f172a', color: '#e2e8f0',
  borderRadius: 6, padding: '2px 10px', fontSize: 12, fontFamily: 'monospace',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
}

export function ShortcutsOverlay({ open, onClose }) {
  const handleEsc = useCallback((e) => {
    if (e.key === 'Escape') onClose?.()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, handleEsc])

  if (!open) return null

  const grouped = {}
  for (const s of SHORTCUT_MAP) {
    if (!grouped[s.category]) grouped[s.category] = []
    grouped[s.category].push(s)
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headingStyle}>
          <span>Keyboard Shortcuts</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}
          >
            x
          </button>
        </div>
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div style={categoryStyle}>{cat}</div>
            {items.map((s) => (
              <div key={s.keys} style={rowStyle}>
                <span>{s.label}</span>
                <kbd style={kbdStyle}>{s.keys}</kbd>
              </div>
            ))}
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: 20, color: '#475569', fontSize: 12 }}>
          Press <kbd style={kbdStyle}>?</kbd> or <kbd style={kbdStyle}>Esc</kbd> to close
        </div>
      </div>
    </div>
  )
}
