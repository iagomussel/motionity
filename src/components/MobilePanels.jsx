function MobilePanels({ activePanel, onClose, children }) {
  if (!activePanel) return null
  return (
    <div className="mobile-panel-overlay" onClick={onClose}>
      <div
        className="mobile-panel-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default MobilePanels
