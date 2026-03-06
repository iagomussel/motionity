import { useState, useCallback } from 'react'
import LegacyEditor from './LegacyEditor.jsx'
import GlobalErrorOverlay from './errorHandling/GlobalErrorOverlay.jsx'
import ProjectAutosave from './project/ProjectAutosave.jsx'
import SaveToast from './components/ui/SaveToast/SaveToast.jsx'

function App() {
  const [editorReady, setEditorReady] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved'

  const handleEditorReady = useCallback(() => {
    setEditorReady(true)
  }, [])

  return (
    <>
      <GlobalErrorOverlay />
      <ProjectAutosave
        enabled={editorReady}
        onSaveStart={() => setSaveStatus('saving')}
        onSaveEnd={() => {
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        }}
      />
      <LegacyEditor onReady={handleEditorReady} />
      <SaveToast status={saveStatus} />
    </>
  )
}

export default App
