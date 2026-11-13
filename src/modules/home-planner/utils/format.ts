/** Metr qiymatini ko‘rsatish (ikki xona aniqlik). */
export const fmtM = (n: number, digits = 2): string =>
  n.toLocaleString('uz-UZ', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const fmtArea = (n: number): string => `${fmtM(n, 2)} m²`;

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
