const ASSET_CATEGORIES = [
  {
    id: 'shapes',
    label: 'Shapes',
    items: [
      { id: 'rect', label: 'Rectangle', type: 'rect', icon: '/assets/shapes/rectangle.svg' },
      { id: 'circle', label: 'Circle', type: 'circle', icon: '/assets/shapes/circle.svg' }
    ]
  },
  {
    id: 'text',
    label: 'Text',
    items: [{ id: 'headline', label: 'Headline', type: 'text', icon: '/assets/text.svg' }]
  },
  {
    id: 'stickers',
    label: 'Stickers',
    items: [
      { id: 'badge', label: 'Badge', type: 'rect', fill: '#f97316', icon: '/assets/star.svg' },
      { id: 'note', label: 'Note', type: 'rect', fill: '#facc15', icon: '/assets/shape.svg' }
    ]
  },
  {
    id: 'photos',
    label: 'Photos',
    items: [
      { id: 'beach', label: 'Beach', type: 'image', src: '/assets/beach.png' },
      { id: 'forest', label: 'Forest', type: 'image', src: '/assets/forest.png' }
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
                    {item.src ? (
                      <img src={item.src} alt="" />
                    ) : item.icon ? (
                      <img src={item.icon} alt="" />
                    ) : (
                      <span>{item.label.slice(0, 2)}</span>
                    )}
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
