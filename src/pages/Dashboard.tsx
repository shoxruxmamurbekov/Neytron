import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookOpen, Calculator, Library, MessageSquare, ShieldCheck, Stethoscope, Zap } from 'lucide-react';
import { Badge, Card, LinkButton } from '../components/ui';
import { problems } from '../data/problems';
import { learningTopics } from '../data/learning';
import { useRecentTopics } from '../hooks/useRecentTopics';

const tools = [
  { to: '/calculators', label: 'Om qonuni', desc: 'U = I × R hisobi', icon: Calculator },
  { to: '/calculators', label: 'Quvvat', desc: 'P = U × I hisobi', icon: Zap },
  { to: '/library', label: 'Bilimlar kutubxonasi', desc: 'Atamalar va jihozlar', icon: Library },
  { to: '/diagnostics', label: 'Diagnostika', desc: 'Muammo bo‘yicha qo‘llanma', icon: Stethoscope },
];

const shortcuts = problems.slice(0, 4);

export default function Dashboard() {
  const { recent } = useRecentTopics();
  const recentTopics = recent
    .map((slug) => learningTopics.find((t) => t.slug === slug))
    .filter((t): t is (typeof learningTopics)[number] => Boolean(t))
    .slice(0, 3);
  const recommended = learningTopics.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome + AI entry */}
      <section className="grid gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <Badge tone="brand">Prototip · AI javoblar simulyatsiya</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Xush kelibsiz, NEYTRON’ga</h1>
            <p className="mt-2 max-w-xl text-[var(--text-muted)]">
              Elektr tizimlarini tushunish, muammolarni aniqlash va xavfsiz yechimlarni topish uchun yordamchi.
              Boshlovchi, uy egasi yoki texnik bo‘lsangiz ham — bu yerda o‘z darajangizga mos ma’lumot bor.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton to="/assistant" variant="primary">
              <MessageSquare className="size-4" aria-hidden /> AI yordamchidan so‘rang
            </LinkButton>
            <LinkButton to="/academy">
              <BookOpen className="size-4" aria-hidden /> O‘rganishni boshlash
            </LinkButton>
          </div>
        </div>
        <Card className="flex flex-col gap-3 border-danger/20 bg-danger-soft">
          <div className="flex items-center gap-2 font-semibold text-danger">
            <AlertTriangle className="size-5" aria-hidden /> Xavfsizlik birinchi o‘rinda
          </div>
          <p className="text-sm text-danger">
            Elektr tokiga urilish, tutun yoki kuyish hidi bo‘lsa — darhol elektr energiyasini o‘chiring va 103 ga qo‘ng‘iroq qiling.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Shikastlangan jihozni o‘zingiz tuzatishga urinmang. Shubhali holatda malakali elektrikka murojaat qiling.
          </p>
        </Card>
      </section>

      {/* Quick tools */}
      <section aria-labelledby="tools-heading" className="flex flex-col gap-3">
        <h2 id="tools-heading" className="text-lg font-semibold">Tezkor vositalar</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tools.map(({ to, label, desc, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="group flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-brand-500/50"
            >
              <Icon className="size-5 text-brand-600 dark:text-brand-100" aria-hidden />
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-xs text-[var(--text-muted)]">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Common problems */}
        <section aria-labelledby="problems-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="problems-heading" className="text-lg font-semibold">Keng uchraydigan muammolar</h2>
            <Link to="/diagnostics" className="text-sm text-brand-600 hover:underline dark:text-brand-100">
              Barchasi
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {shortcuts.map((p) => (
              <Link
                key={p.id}
                to={`/diagnostics?problem=${p.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:border-brand-500/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.title}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">{p.summary}</p>
                </div>
                {p.emergency ? <Badge tone="danger">Favqulodda</Badge> : <ArrowRight className="size-4 shrink-0" aria-hidden />}
              </Link>
            ))}
          </div>
        </section>

        {/* Recently viewed + recommendations */}
        <section aria-labelledby="learn-heading" className="flex flex-col gap-3">
          <h2 id="learn-heading" className="text-lg font-semibold">O‘rganish</h2>
          <Card className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium">So‘nggi ko‘rilgan mavzular</p>
              {recentTopics.length === 0 ? (
                <p className="mt-1 text-sm text-[var(--text-muted)]">Hali mavzu ko‘rilmagan. Quyidan boshlang.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {recentTopics.map((t) => (
                    <li key={t.slug}>
                      <Link to={`/academy/${t.slug}`} className="text-sm text-brand-600 hover:underline dark:text-brand-100">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-[var(--border)] pt-4">
              <p className="text-sm font-medium">Tavsiya etiladi</p>
              <ul className="mt-2 flex flex-col gap-2">
                {recommended.map((t) => (
                  <li key={t.slug} className="flex items-center justify-between gap-3 text-sm">
                    <span>{t.title}</span>
                    <Link to={`/academy/${t.slug}`} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-100 dark:hover:bg-brand-500/15">
                      Ochish
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </section>
      </div>

      {/* Safety footer */}
      <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 text-success" aria-hidden />
          <div>
            <p className="font-medium">Xavfsizlik eslatmasi</p>
            <p className="text-sm text-[var(--text-muted)]">
              Har qanday ta’mirlashdan oldin elektr energiyasini o‘chiring va kuchlanish yo‘qligiga ishonch hosil qiling. Murakkab ishlar uchun malakali mutaxassis.
            </p>
          </div>
        </div>
        <LinkButton to="/about">Batafsil</LinkButton>
      </Card>
    </div>
  );
}
