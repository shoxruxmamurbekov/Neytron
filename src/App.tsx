import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Diagnostics from './pages/Diagnostics';
import Learning from './pages/Learning';
import LearningTopic from './pages/LearningTopic';
import Calculators from './pages/Calculators';
import Knowledge from './pages/Knowledge';
import About from './pages/About';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="diagnostics" element={<Diagnostics />} />
        <Route path="learning" element={<Learning />} />
        <Route path="learning/:slug" element={<LearningTopic />} />
        <Route path="calculators" element={<Calculators />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="about" element={<About />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
