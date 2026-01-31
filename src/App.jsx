import LegacyEditor from './LegacyEditor.jsx'
import GlobalErrorOverlay from './errorHandling/GlobalErrorOverlay.jsx'
import ProjectAutosave from './project/ProjectAutosave.jsx'

function App() {
  return (
    <>
      <GlobalErrorOverlay />
      <ProjectAutosave />
      <LegacyEditor />
    </>
  )
}

export default App
