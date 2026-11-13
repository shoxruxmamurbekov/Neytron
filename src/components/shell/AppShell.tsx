import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import ErrorBoundary from '../ErrorBoundary';
import { LoadingState } from '../ui';
import MobileNavigation from './MobileNavigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  useTheme();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh lg:flex">
      <a
        href="#main"
        className="sr-only z-50 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Asosiy mazmunga o‘tish
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 pb-28 focus:outline-none sm:px-6 lg:px-10 lg:py-8 lg:pb-8">
          <div className="mx-auto max-w-6xl">
            <ErrorBoundary key={pathname}>
              <Suspense fallback={<LoadingState />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
