import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';

interface State {
  error: Error | null;
}

/** Sahifa ichidagi kutilmagan xatoni ushlab, butun ilova qulashining oldini oladi. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NEYTRON sahifa xatosi:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-10 text-center text-danger">
        <TriangleAlert className="size-8" aria-hidden />
        <p className="font-semibold">Sahifani ko‘rsatib bo‘lmadi</p>
        <p className="max-w-sm text-sm">Kutilmagan xatolik yuz berdi. Sahifani yangilang yoki boshqa bo‘limga o‘ting.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl border border-danger/40 px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]"
        >
          Sahifani yangilash
        </button>
      </div>
    );
  }
}
