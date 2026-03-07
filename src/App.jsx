import { useState, useCallback, useEffect } from 'react'

import { EditorShell } from './components/layout/EditorShell/EditorShell'
import { TopBar } from './components/layout/TopBar/TopBar'
import { LeftPanel } from './components/layout/LeftPanel/LeftPanel'
import { RightPanel } from './components/layout/RightPanel/RightPanel'
import { CanvasArea } from './components/layout/CanvasArea/CanvasArea'
import { Timeline } from './components/layout/Timeline/Timeline'
import { SaveToast } from './components/ui/SaveToast/SaveToast'
import GlobalErrorOverlay from './errorHandling/GlobalErrorOverlay.jsx'
import { isSaveShortcut } from './project/hotkeys.js'
import { saveCurrentProject, loadCurrentProject } from './project/storage.js'
import { createProjectV1 } from './project/model.js'

const LEFT_TABS = [
  { id: 'media',  icon: '🖼', label: 'Media'  },
  { id: 'text',   icon: 'T',  label: 'Text'   },
  { id: 'shapes', icon: '◻',  label: 'Shapes' },
  { id: 'layers', icon: '⊞',  label: 'Layers' },
]

const DEFAULT_DURATION = 15

function nowIso() {
  return new Date().toISOString()
}

function App() {
  const [projectName, setProjectName] = useState(() => {
    try {
      const saved = loadCurrentProject({ storage: window.localStorage })
      return saved?.name ?? 'Untitled Project'
    } catch {
      return 'Untitled Project'
    }
  })

  const [saveStatus, setSaveStatus] = useState('idle')
  const [activeTool, setActiveTool]   = useState('select')
  const [isPlaying, setIsPlaying]     = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration]                    = useState(DEFAULT_DURATION)
  const [tracks]                      = useState([])

  // Ctrl/Cmd+S → save to localStorage
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!isSaveShortcut(e)) return
      e.preventDefault()
      setSaveStatus('saving')
      const now = nowIso()
      const project = createProjectV1({ now, name: projectName, legacyData: {} })
      try {
        saveCurrentProject({ storage: window.localStorage, project, now })
      } catch {
        // ignore – storage may be unavailable
      }
      setSaveStatus('saved')
      const timer = setTimeout(() => setSaveStatus('idle'), 2000)
      return () => clearTimeout(timer)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [projectName])

  const handleProjectNameChange = useCallback((name) => setProjectName(name), [])

  return (
    <>
      <GlobalErrorOverlay />

      <EditorShell
        topBar={
          <TopBar
            projectName={projectName}
            onProjectNameChange={handleProjectNameChange}
          />
        }
        leftPanel={<LeftPanel tabs={LEFT_TABS} />}
        rightPanel={<RightPanel />}
        timeline={
          <Timeline
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            tracks={tracks}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onSkipToStart={() => setCurrentTime(0)}
            onSkipToEnd={() => setCurrentTime(duration)}
            onSeek={setCurrentTime}
          />
        }
      >
        <CanvasArea
          activeTool={activeTool}
          onToolChange={setActiveTool}
        />
      </EditorShell>

      <SaveToast status={saveStatus} />
    </>
  )
}

export default App
