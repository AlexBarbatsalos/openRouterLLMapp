import { useState } from 'react';
import Layout from './components/Layout';
import LLMQueryApp from './components/LLMQueryApp';
import NoteEditor from './components/NoteEditor';
import ProjectSidebar from './components/ProjectSidebar';
import TopbarControls from './components/TopbarControls';
import { ModelSettingsProvider } from './context/ModelSettingsContext';

function App() {
  const [activeProject, setActiveProject] = useState("default");


  console.log("LEFT (ProjectSidebar):", <ProjectSidebar />);
  console.log("RIGHT (NoteEditor):", <NoteEditor projectId={activeProject} />);

  return (
    <ModelSettingsProvider>
      <Layout
        sidebarContent={<ProjectSidebar onSelect={setActiveProject} />}
        topbarContent={<TopbarControls  />}
        rightbarContent={<NoteEditor projectId={activeProject} />}
      >
        <LLMQueryApp projectId={activeProject} />
      </Layout>
  </ModelSettingsProvider>
  );
}

export default App;
