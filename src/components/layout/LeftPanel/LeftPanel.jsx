import { useState } from 'react'
import styles from './LeftPanel.module.css'

const DEFAULT_TABS = [
  { id: 'media',  icon: '🖼', label: 'Media'  },
  { id: 'text',   icon: 'T',  label: 'Text'   },
  { id: 'shapes', icon: '◻',  label: 'Shapes' },
  { id: 'layers', icon: '⊞',  label: 'Layers' },
]

/**
 * LeftPanel — collapsible sidebar with tab navigation.
 *
 * @param {Array<{id, icon, label, content}>} tabs
 * @param {string} activeTab  — controlled active tab id
 * @param {Function} onTabChange
 * @param {boolean} collapsed
 * @param {boolean} mobileOpen
 */
export function LeftPanel({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  collapsed = false,
  mobileOpen = false,
  children,
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
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={currentTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={[
                styles.tab,
                currentTab === tab.id ? styles.active : '',
              ].filter(Boolean).join(' ')}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <span className={styles['tab-icon']} aria-hidden="true">{tab.icon}</span>
              <span className={styles['tab-label']}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div
        id={`panel-${currentTab}`}
        className={styles.content}
        role="tabpanel"
        aria-label={tabs.find(t => t.id === currentTab)?.label}
      >
        {children}
      </div>
    </aside>
  )
}

export default LeftPanel
