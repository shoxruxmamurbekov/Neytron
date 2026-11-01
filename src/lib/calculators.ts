/** Elektr hisob-kitoblari. Kabel kesimi yoki himoya avtomatini tanlash bu yerda yo‘q. */

export type Result = { ok: true; value: number } | { ok: false; error: string };

const parse = (raw: string): number | null => {
  const normalized = raw.trim().replace(',', '.');
  if (normalized === '') return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
};

const positive = (raw: string, name: string): Result => {
  const n = parse(raw);
  if (n === null) return { ok: false, error: `${name} raqam bo‘lishi kerak` };
  if (n <= 0) return { ok: false, error: `${name} musbat bo‘lishi kerak` };
  return { ok: true, value: n };
};

const nonNegative = (raw: string, name: string): Result => {
  const n = parse(raw);
  if (n === null) return { ok: false, error: `${name} raqam bo‘lishi kerak` };
  if (n < 0) return { ok: false, error: `${name} manfiy bo‘lishi mumkin emas` };
  return { ok: true, value: n };
};

/** Om qonuni: U = I × R. Berilgan ikki qiymatdan uchinchisini hisoblaydi. */
export function ohmsLaw(target: 'U' | 'I' | 'R', u: string, i: string, r: string): Result {
  if (target === 'U') {
    const I = positive(i, 'Tok (I)');
    const R = positive(r, 'Qarshilik (R)');
    if (!I.ok) return I;
    if (!R.ok) return R;
    return { ok: true, value: I.value * R.value };
  }
  if (target === 'I') {
    const U = positive(u, 'Kuchlanish (U)');
    const R = positive(r, 'Qarshilik (R)');
    if (!U.ok) return U;
    if (!R.ok) return R;
    return { ok: true, value: U.value / R.value };
  }
  const U = positive(u, 'Kuchlanish (U)');
  const I = positive(i, 'Tok (I)');
  if (!U.ok) return U;
  if (!I.ok) return I;
  return { ok: true, value: U.value / I.value };
}

/** Quvvat: P = U × I */
export function powerFromUI(u: string, i: string): Result {
  const U = positive(u, 'Kuchlanish (U)');
  const I = positive(i, 'Tok (I)');
  if (!U.ok) return U;
  if (!I.ok) return I;
  return { ok: true, value: U.value * I.value };
}

/** Tok: I = P / U (bir fazali, quvvat koeffitsiyentisiz — taxminiy). */
export function currentFromPU(p: string, u: string): Result {
  const P = positive(p, 'Quvvat (P)');
  const U = positive(u, 'Kuchlanish (U)');
  if (!P.ok) return P;
  if (!U.ok) return U;
  return { ok: true, value: P.value / U.value };
}

/** Energiya sarfi: E (kVt·soat) = P (W) × soat / 1000 */
export function energyKwh(powerW: string, hours: string): Result {
  const P = nonNegative(powerW, 'Quvvat (W)');
  const H = nonNegative(hours, 'Soat');
  if (!P.ok) return P;
  if (!H.ok) return H;
  return { ok: true, value: (P.value * H.value) / 1000 };
}

/** Narx: kVt·soat × tarif (so‘m/kVt·soat) */
export function electricityCost(kwh: number, tariff: string): Result {
  const T = nonNegative(tariff, 'Tarif');
  if (!T.ok) return T;
  return { ok: true, value: kwh * T.value };
}

export const fmt = (n: number, digits = 2) =>
  n.toLocaleString('uz-UZ', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
