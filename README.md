# NEYTRON

Elektr tizimlari bo'yicha aqlli bilim va yordam platformasi. Ushbu bosqich — **faqat frontend prototip**.

## Imkoniyatlar

- **Bosh sahifa** — yo'nalish, tezkor vositalar, tavsiyalar, xavfsizlik ko'rsatmalari
- **AI yordamchi** — savol kiritish, kategoriya tanlash, rasm yuklash (oldindan ko'rish), namunaviy savollar. Javoblar **simulyatsiya** qilinadi.
- **Diagnostika** — 6 ta tipik muammo uchun bosqichma-bosqich qo'llanma; xavfli holatlarda avval favqulodda xavfsizlik
- **O'quv markazi** — asosiy elektr tushunchalari kartochkalari va sahifalari
- **Kalkulyatorlar** — Om qonuni, quvvat, tok, energiya sarfi, elektr narxi (validatsiya bilan)
- **Bilimlar kutubxonasi** — qidiruv va kategoriya filtrlari (demo ma'lumot)
- **Sozlamalar** — mavzu (yorug'/qorong'i)

## Texnologiyalar

React 18 · TypeScript · Vite · Tailwind CSS v4 · React Router · Lucide icons

## Ishga tushirish

```bash
npm install
npm run dev      # ishlab chiqish serveri
npm run build    # production build (tsc + vite)
npm run preview  # build natijasini ko'rish
```

## Loyiha tuzilishi

```
src/
  components/   umumiy UI komponentlar (Card, Button, PageHeader, ...)
  layouts/      AppLayout (sidebar + mobil navigatsiya)
  pages/        sahifalar (marshrutlar)
  features/     assistant, diagnostics, learning, calculators, knowledge
  data/         demo ma'lumotlar (mock)
  hooks/        umumiy hooklar
  lib/          yordamchi funksiyalar (hisob-kitoblar, qidiruv)
  types/        TypeScript turlari
  styles/       (global CSS: src/index.css)
```

## Cheklovlar

- Backend, haqiqiy AI integratsiya, ma'lumotlar bazasi va apparat boshqaruvi yo'q.
- Kabel kesimi va himoya qurilmasini tanlash uchun aniq hisob-kitob berilmaydi — mahalliy standartlar va muhandislik parametrlari talab qilinadi.
- Interfeys hozircha faqat o'zbek (lotin) tilida; ko'p tillilik uchun arxitektura tayyorlangan.

## Xavfsizlik eslatmasi

Elektr tokiga urilish, tutun, kuygan hid yoki ochiq o'tkazgich bo'lsa — darhol elektr energiyasini o'chiring va favqulodda xizmatga (**103**) yoki malakali elektrikka murojaat qiling.
