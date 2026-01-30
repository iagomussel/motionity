import { useState } from 'react'

const MENU_GROUPS = [
  { id: 'uploads', label: 'Uploads', icon: '/assets/uploads.svg' },
  { id: 'objects', label: 'Objects', icon: '/assets/shape.svg' },
  { id: 'images', label: 'Images', icon: '/assets/image.svg' },
  { id: 'texts', label: 'Texts', icon: '/assets/text.svg' },
  { id: 'videos', label: 'Videos', icon: '/assets/video.svg' },
  { id: 'audios', label: 'Audios', icon: '/assets/audio.svg' },
  { id: 'lotties', label: 'Lotties', icon: '/assets/zappy.svg' }
]

function SideMenu() {
  const [openGroups, setOpenGroups] = useState(() => new Set(['uploads']))

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="side-menu">
      <div className="side-menu-header">Library</div>
      <div className="side-menu-groups">
        {MENU_GROUPS.map((group) => {
          const isOpen = openGroups.has(group.id)
          return (
            <div key={group.id} className="side-menu-group">
              <button
                type="button"
                className={`side-menu-trigger ${isOpen ? 'open' : ''}`}
                onClick={() => toggleGroup(group.id)}
              >
                <img src={group.icon} alt="" />
                <span>{group.label}</span>
                <span className="chevron">▾</span>
              </button>
              {isOpen && (
                <div className="side-menu-panel">
                  <span className="side-menu-placeholder">Empty</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SideMenu
