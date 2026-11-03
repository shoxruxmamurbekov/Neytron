import { useEffect, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, X } from 'lucide-react';

const cx = (...parts: (string | false | undefined | null)[]) => parts.filter(Boolean).join(' ');

export function Card({ children, className, as: Tag = 'div' }: { children: ReactNode; className?: string; as?: 'div' | 'section' | 'article' }) {
  return (
    <Tag
      className={cx(
        'rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-500/50',
  secondary: 'border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]',
  ghost: 'hover:bg-[var(--surface-muted)]',
  danger: 'bg-danger text-white hover:opacity-90',
};

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed',
        variants[variant],
        className,
      )}
    />
  );
}

export function LinkButton({ to, children, variant = 'secondary' }: { to: string; children: ReactNode; variant?: Variant }) {
  return (
    <Link
      to={to}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors',
        variants[variant],
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'brand' | 'danger' | 'success' | 'warning' }) {
  const tones = {
    neutral: 'bg-[var(--surface-muted)] text-[var(--text-muted)] border-[var(--border)]',
    brand: 'bg-brand-50 text-brand-700 border-brand-100 dark:bg-brand-500/15 dark:text-brand-100 dark:border-brand-500/30',
    danger: 'bg-danger-soft text-danger border-danger/20',
    success: 'bg-success-soft text-success border-success/20',
    warning: 'bg-warning-soft text-warning border-warning/20',
  };
  return (
    <span className={cx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  );
}

export function Field({ label, hint, error, children, id }: { label: string; hint?: string; error?: string; children: ReactNode; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(inputClass, props.className)} />;
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
      <Inbox className="size-8 text-[var(--text-muted)]" aria-hidden />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-[var(--text-muted)]">{description}</p>}
    </div>
  );
}

export function Spinner({ label = 'Yuklanmoqda…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
      <span className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" aria-hidden />
      {label}
    </div>
  );
}

/** Oddiy modal dialog: Escape bilan yopiladi, fon bosilganda yopiladi, sarlavha aria-labelledby bilan bog‘langan. */
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const titleId = `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button type="button" aria-label="Yopish" tabIndex={-1} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(
          'relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl sm:rounded-2xl',
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="grid size-9 place-items-center rounded-lg hover:bg-[var(--surface-muted)]"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function Disclaimer({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning dark:text-volt">
      {children}
    </div>
  );
}
