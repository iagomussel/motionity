const TEMPLATE_PRESETS = [
  {
    id: 'bold-title',
    name: 'Bold Title',
    description: 'Hero text + accent block',
    objects: [
      {
        type: 'rect',
        width: 320,
        height: 180,
        x: 100,
        y: 120,
        fill: '#2563eb'
      },
      {
        type: 'text',
        width: 320,
        height: 60,
        x: 140,
        y: 160,
        text: 'Bold Title',
        fontSize: 36,
        fill: '#f8fafc'
      }
    ]
  },
  {
    id: 'product-promo',
    name: 'Product Promo',
    description: 'Image + price tag',
    objects: [
      {
        type: 'image',
        width: 240,
        height: 160,
        x: 80,
        y: 110,
        src: '/assets/office.png'
      },
      {
        type: 'rect',
        width: 140,
        height: 48,
        x: 220,
        y: 260,
        fill: '#f97316'
      },
      {
        type: 'text',
        width: 140,
        height: 40,
        x: 240,
        y: 270,
        text: '$129',
        fontSize: 24,
        fill: '#0b1220'
      }
    ]
  },
  {
    id: 'subtitle-block',
    name: 'Subtitle Block',
    description: 'Stacked labels',
    objects: [
      {
        type: 'rect',
        width: 260,
        height: 64,
        x: 120,
        y: 140,
        fill: '#0ea5e9'
      },
      {
        type: 'text',
        width: 260,
        height: 40,
        x: 140,
        y: 155,
        text: 'New Release',
        fontSize: 22,
        fill: '#f8fafc'
      },
      {
        type: 'text',
        width: 260,
        height: 40,
        x: 140,
        y: 220,
        text: 'Subtitle goes here',
        fontSize: 18,
        fill: '#cbd5f5'
      }
    ]
  }
]

function TemplatesPanel({ onApplyTemplate, compact = false }) {
  return (
    <aside className={`templates-panel ${compact ? 'compact' : ''}`.trim()}>
      <div className="templates-header">
        <h3>Templates</h3>
        {!compact && <span>One tap apply</span>}
      </div>
      <div className="templates-grid">
        {TEMPLATE_PRESETS.map((template) => (
          <button
            key={template.id}
            type="button"
            className="template-card"
            onClick={() => onApplyTemplate(template)}
          >
            <div className="template-thumb">
              <span>{template.name.split(' ')[0]}</span>
            </div>
            <div className="template-info">
              <strong>{template.name}</strong>
              <span>{template.description}</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  )
}

export default TemplatesPanel
