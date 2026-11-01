import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge, Card, PageHeader } from '../components/ui';
import { learningTopics } from '../data/learning';
import { useRecentTopics } from '../hooks/useRecentTopics';

export default function Learning() {
  const { recent } = useRecentTopics();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="O‘quv markazi"
        description="Elektrning asosiy tushunchalari — oddiy tilda, misollar bilan."
      />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {learningTopics.map((t) => (
          <li key={t.slug}>
            <Link to={`/learning/${t.slug}`} className="group block h-full">
              <Card className="flex h-full flex-col gap-3 transition-colors group-hover:border-brand-500/50">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={t.level.includes('O‘rta') ? 'warning' : 'success'}>{t.level}</Badge>
                  {recent.includes(t.slug) && <Badge tone="brand">Ko‘rilgan</Badge>}
                </div>
                <h2 className="font-semibold">{t.title}</h2>
                <p className="flex-1 text-sm text-[var(--text-muted)]">{t.summary}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-100">
                  O‘qish <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
