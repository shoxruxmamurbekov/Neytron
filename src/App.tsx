import { lazy } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Diagnostics from './pages/Diagnostics';
import Learning from './pages/Learning';
import LearningTopic from './pages/LearningTopic';
import Calculators from './pages/Calculators';
import Knowledge from './pages/Knowledge';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import About from './pages/About';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// 3D kutubxonalar (three.js) katta — modul faqat kerak bo‘lganda yuklanadi
const HomePlanner = lazy(() => import('./modules/home-planner/pages/HomePlanner'));

/** Eski manzillar (v0.1) yangi marshrutlarga yo‘naltiriladi — saqlangan havolalar buzilmasin. */
function LegacyTopicRedirect() {
  const { slug } = useParams();
  return <Navigate to={slug ? `/academy/${slug}` : '/academy'} replace />;
}

function LegacyPlannerRedirect() {
  const rest = useParams()['*'];
  return <Navigate to={rest ? `/visual-montage/${rest}` : '/visual-montage'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assistant" element={<Assistant />} />
        <Route path="diagnostics" element={<Diagnostics />} />
        <Route path="calculators" element={<Calculators />} />
        <Route path="visual-montage/*" element={<HomePlanner />} />
        <Route path="academy" element={<Learning />} />
        <Route path="academy/:slug" element={<LearningTopic />} />
        <Route path="library" element={<Knowledge />} />
        <Route path="projects" element={<Projects />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />

        <Route path="learning" element={<Navigate to="/academy" replace />} />
        <Route path="learning/:slug" element={<LegacyTopicRedirect />} />
        <Route path="knowledge" element={<Navigate to="/library" replace />} />
        <Route path="uy-loyihasi/*" element={<LegacyPlannerRedirect />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
