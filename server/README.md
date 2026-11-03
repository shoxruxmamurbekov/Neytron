# NEYTRON server (1-bosqich)

Express + TypeScript API. Ma’lumot SQLite'da (`node:sqlite`, Node 22+), autentifikatsiya JWT bilan.

## Ishga tushirish

```
cd server
npm install
npm run dev          # http://localhost:8080/api/health
npm test
```

Muhit o‘zgaruvchilari:

| Nomi | Standart | Izoh |
|---|---|---|
| `PORT` | 8080 | |
| `DB_PATH` | data/neytron.db | |
| `JWT_SECRET` | dev zaxira kaliti | Production'da majburiy |
| `TOKEN_TTL` | 7d | |
| `CORS_ORIGIN` | http://localhost:5173 | Frontend manzili |

## API

| Metod | Yo‘l | Izoh |
|---|---|---|
| GET | /api/health | Holat |
| POST | /api/auth/register | `{email, name, password}` → `{user, token}` |
| POST | /api/auth/login | `{email, password}` → `{user, token}` |
| GET | /api/auth/me | Bearer token |
| GET | /api/projects | Foydalanuvchi loyihalari |
| POST | /api/projects | `{name, data}` |
| GET/PUT/DELETE | /api/projects/:id | Faqat egasi uchun |

Loyiha `data` maydoni frontend'dagi to‘liq Project ob’ekti sifatida saqlanadi.
