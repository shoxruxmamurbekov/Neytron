import { Card, PageHeader } from '../components/ui';

const principles = [
  'Xavfsizlik har doim birinchi o‘rinda.',
  'Tushuntirish oddiy, lekin texnik jihatdan to‘g‘ri bo‘ladi.',
  'Xavfli ta’mirlash ishlari faqat malakali mutaxassis tomonidan bajariladi.',
];

export default function About() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="NEYTRON haqida" description="Elektr engineering’ni hamma uchun tushunarli qilish maqsadidagi platforma." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Maqsad</h2>
          <p className="text-[15px] leading-relaxed">
            NEYTRON boshlovchilar, uy egalari va elektrik-texniklarga elektr tizimlarini tushunishga, muammolarni aniqlashga va xavfsiz
            yechimlarni topishga yordam berishi kerak. Boshlang‘ich yo‘nalish — turar joy elektr tizimlari; keyinchalik sanoat
            avtomatlashtirish va quvvat injiniringiga kengaytirish nazarda tutilgan.
          </p>
        </Card>
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Tamoyillar</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {principles.map((p) => (
              <li key={p} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2">
                {p}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="flex flex-col gap-3 border-warning/40">
        <h2 className="text-lg font-semibold">Joriy holat</h2>
        <p className="text-[15px] leading-relaxed">
          Bu <strong>frontend prototip</strong>. Backend, haqiqiy AI integratsiyasi, ma’lumotlar bazasi va apparat boshqaruvi hali yo‘q.
          AI yordamchi javoblari namunaviy va simulyatsiya qilinadi.
        </p>
      </Card>
    </div>
  );
}
