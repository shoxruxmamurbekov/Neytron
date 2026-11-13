import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { ProjectStoreProvider } from '../store/ProjectStore';
import ProjectsDashboard from '../project/ProjectsDashboard';
import ProjectWorkspace from '../project/ProjectWorkspace';

/** “Uy loyihasi” moduli kirish nuqtasi: loyihalar ro‘yxati va bitta loyiha ish maydoni. */
export default function HomePlanner() {
  return (
    <ProjectStoreProvider>
      <Routes>
        <Route index element={<ProjectsDashboard />} />
        <Route path=":projectId" element={<WorkspaceRoute />} />
        <Route path="*" element={<Navigate to="/uy-loyihasi" replace />} />
      </Routes>
    </ProjectStoreProvider>
  );
}

function WorkspaceRoute() {
  const { projectId } = useParams();
  return <ProjectWorkspace projectId={projectId ?? ''} />;
}
