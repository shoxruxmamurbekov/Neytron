import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Lightbulb, ListChecks } from 'lucide-react';
import { Badge, Card, EmptyState } from '../components/ui';
import { learningTopics } from '../data/learning';
import { useRecentTopics } from '../hooks/useRecentTopics';

export default function LearningTopic() {
  const { slug } = useParams();
  const topic = learningTopics.find((t) => t.slug === slug);
  const { markViewed } = useRecentTopics();

  useEffect(() => {
    if (topic) markViewed(topic.slug);
  }, [topic, markViewed]);

  if (!topic) {
    return <EmptyState title="Mavzu topilmadi" description="Ro‘yxatdan boshqa mavzuni tanlang." />;
  }

  const index = learningTopics.findIndex((t) => t.slug === topic.slug);
  const prev = learningTopics[index - 1];
  const next = learningTopics[index + 1];

  return (
    <article className="flex flex-col gap-6">
      <Link to="/academy" className="inline-flex w-fit items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft className="size-4" aria-hidden /> O‘quv markazi
      </Link>

      <header className="flex flex-col gap-3">
        <Badge tone="brand">{topic.level}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{topic.title}</h1>
        <p className="max-w-2xl text-lg text-[var(--text-muted)]">{topic.summary}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          {topic.sections.map((s) => (
            <Card key={s.heading} as="section">
              <h2 className="mb-2 text-lg font-semibold">{s.heading}</h2>
              <div className="flex flex-col gap-3 text-[15px] leading-relaxed">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Card>
          ))}

          <Card as="section" className="border-brand-500/30 bg-brand-50 dark:bg-brand-500/10">
            <div className="flex items-center gap-2 font-semibold text-brand-700 dark:text-brand-100">
              <Lightbulb className="size-5" aria-hidden /> Misol
            </div>
            <p className="mt-2 text-[15px]">{topic.example}</p>
          </Card>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:h-fit">
          <Card as="section">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <ListChecks className="size-5 text-success" aria-hidden /> Asosiy nuqtalar
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {topic.keyPoints.map((k) => (
                <li key={k} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2">
                  {k}
                </li>
              ))}
            </ul>
          </Card>

          <nav aria-label="Mavzular o‘rtasida o‘tish" className="flex flex-col gap-2 text-sm">
            {prev && (
              <Link to={`/academy/${prev.slug}`} className="rounded-xl border border-[var(--border)] px-4 py-3 hover:border-brand-500/50">
                <span className="block text-xs text-[var(--text-muted)]">← Oldingi</span>
                {prev.title}
              </Link>
            )}
            {next && (
              <Link to={`/academy/${next.slug}`} className="rounded-xl border border-[var(--border)] px-4 py-3 text-right hover:border-brand-500/50">
                <span className="block text-xs text-[var(--text-muted)]">Keyingi →</span>
                {next.title}
              </Link>
            )}
          </nav>
        </aside>
      </div>
    </article>
  );
}
