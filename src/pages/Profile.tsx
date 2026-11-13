import { Settings, UserRound } from 'lucide-react';
import { Card, LinkButton, PageHeader } from '../components/ui';

export default function Profile() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Profil va sozlamalar" description="Hisob va interfeys sozlamalari." />

      <Card as="section" className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100">
            <UserRound className="size-6" aria-hidden />
          </span>
          <div>
            <h2 className="font-semibold">Mehmon</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Hisob tizimi hali ulanmagan. Ma’lumotlar faqat shu brauzerda saqlanadi.
            </p>
          </div>
        </div>
        <div>
          <LinkButton to="/settings" variant="primary">
            <Settings className="size-4" aria-hidden /> Sozlamalarni ochish
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
