/**
 * SaveToast — a small status indicator that appears when the project is saved.
 * Sits in the bottom-right corner, above the controls.
 *
 * @param {'idle'|'saving'|'saved'} status
 */
export function SaveToast({ status }) {
  if (status === 'idle') return null

  const isSaving = status === 'saving'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isSaving ? 'Saving project' : 'Project saved'}
      style={{
        position: 'fixed',
        bottom: 76,   /* sits above #controls bar (~60px) */
        right: 20,
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 14px',
        borderRadius: 20,
        background: isSaving
          ? 'var(--color-surface-overlay, #1A1A26)'
          : 'rgba(34,197,94,0.15)',
        border: `1px solid ${isSaving
          ? 'var(--color-border, #2A2A3E)'
          : 'rgba(34,197,94,0.35)'}`,
        color: isSaving
          ? 'var(--color-text-secondary, #9898B8)'
          : 'var(--color-success, #22C55E)',
        fontFamily: 'var(--font-family-sans, Inter, system-ui, sans-serif)',
        fontSize: 12,
        fontWeight: 600,
        boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.5))',
        pointerEvents: 'none',
        userSelect: 'none',
        transition: 'opacity 200ms ease',
      }}
    >
      {isSaving ? (
        <>
          <span style={{ opacity: 0.6 }}>Saving…</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">✓</span>
          <span>Saved</span>
        </>
      )}
    </div>
  )
}

export default SaveToast
