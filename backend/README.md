# NEYTRON Backend

NestJS 11 · TypeScript · Prisma 6 · PostgreSQL 16 · modular monolith.

Bu bosqichda: asos (konfiguratsiya, muhit validatsiyasi, Prisma servisi, yagona xato formati, health endpoint, Swagger, Helmet, CORS, rate limit).

## Ishga tushirish (mahalliy)

```bash
cp .env.example .env          # JWT sirlarini almashtiring (kamida 32 belgi)
npm install
npx prisma generate
npx prisma migrate dev        # migratsiyalar (keyingi bosqichlarda qo'shiladi)
npm run start:dev             # http://localhost:3000/api/v1/health
```

Docker bilan: `docker compose up -d --build` (PostgreSQL va API).

Swagger: `http://localhost:3000/api/docs` (`SWAGGER_ENABLED=true` bo'lganda).

## Skriptlar

| Buyruq | Vazifa |
|---|---|
| `npm run start:dev` | Ishlab chiqish rejimi |
| `npm run build` | Production build (`dist/`) |
| `npm run lint` | ESLint |
| `npm run format:check` | Prettier tekshiruvi |
| `npm test` | Unit testlar (Jest) |
| `npm run prisma:validate` | Prisma sxemasini tekshirish |
| `npm run prisma:migrate` | Dev migratsiya |
| `npm run prisma:deploy` | Production migratsiya |
| `npm run prisma:seed` | Demo ma'lumotlar |

## API konvensiyasi

- Baza yo'li: `/api/v1`.
- Muvaffaqiyat: `{ "data": ... }`, ro'yxatlar uchun `{ "data": [...], "meta": { page, pageSize, totalItems, totalPages } }`.
- Xato: `{ "error": { statusCode, code, message, details?, path, timestamp } }`.

## Xavfsizlik

- Parollar faqat xesh ko'rinishida saqlanadi (Argon2id), javoblarda hech qachon chiqmaydi.
- Sirlar faqat muhit o'zgaruvchilarida; `.env` repozitoriyaga kiritilmaydi.
- Helmet, CORS allowlist, rate limit, DTO validatsiyasi (whitelist + forbidNonWhitelisted).

## Holat

- Tayyor va tekshirilgan: konfiguratsiya validatsiyasi, xato filtri (unit testlar).
- Tayyor, lekin hali ishga tushirilmagan: Prisma klienti generatsiyasi, health endpoint (DB ulanishi), Docker fayllari. Sabab: quyida "Cheklovlar".

## Cheklovlar (ushbu sessiya muhiti)

- Prisma CLI `binaries.prisma.sh` dan query/schema engine binarini yuklaydi. Ushbu muhitda bu host siyosat bo'yicha bloklangan (403), shuning uchun `prisma generate`, `validate` va `migrate` bu yerda ishlamaydi. Mahalliy kompyuterda yoki ushbu host ruxsat etilganda ishlaydi.
- Docker daemon bu muhitda ishlamaydi, shuning uchun `docker compose` bu yerda sinalmagan.
