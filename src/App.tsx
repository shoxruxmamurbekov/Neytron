import { lazy, Suspense } from 'react';
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

// 3D kutubxonalar (three.js) katta — modul faqat kerak bo‘lganda yuklanadi
const HomePlanner = lazy(() => import('./modules/home-planner/pages/HomePlanner'));

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route
          path="uy-loyihasi/*"
          element={
            <Suspense fallback={<p className="p-6 text-sm text-[var(--text-muted)]">Yuklanmoqda…</p>}>
              <HomePlanner />
            </Suspense>
          }
        />
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
