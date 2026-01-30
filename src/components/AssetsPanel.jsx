const ASSET_CATEGORIES = [
  {
    id: 'shapes',
    label: 'Shapes',
    items: [
      { id: 'rect', label: 'Rectangle', type: 'rect' },
      { id: 'circle', label: 'Circle', type: 'circle' }
    ]
  },
  {
    id: 'text',
    label: 'Text',
    items: [{ id: 'headline', label: 'Headline', type: 'text' }]
  },
  {
    id: 'stickers',
    label: 'Stickers',
    items: [
      { id: 'badge', label: 'Badge', type: 'rect', fill: '#f97316' },
      { id: 'note', label: 'Note', type: 'rect', fill: '#facc15' }
    ]
  }
]

function AssetsPanel({ onAddAsset, compact = false }) {
  return (
    <aside className={`assets-panel ${compact ? 'compact' : ''}`.trim()}>
      <div className="assets-header">
        <h3>Assets</h3>
        {!compact && <span>Drag into canvas</span>}
      </div>
      <div className="assets-categories">
        {ASSET_CATEGORIES.map((category) => (
          <div key={category.id} className="assets-category">
            <div className="assets-category-title">{category.label}</div>
            <div className="assets-grid">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="asset-card"
                  draggable
                  onClick={() => onAddAsset(item)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      'application/motionity-asset',
                      JSON.stringify(item)
                    )
                    event.dataTransfer.effectAllowed = 'copy'
                  }}
                >
                  <div className="asset-thumb">
                    <span>{item.label.slice(0, 2)}</span>
                  </div>
                  <span className="asset-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default AssetsPanel
