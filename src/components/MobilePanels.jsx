function MobilePanels({ activePanel, onClose, position = 'bottom', children }) {
  if (!activePanel) return null
  return (
    <div className={`mobile-panel-overlay ${position}`} onClick={onClose}>
      <div
        className={`mobile-panel-sheet ${position}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default MobilePanels
