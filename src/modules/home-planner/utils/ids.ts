let counter = 0;

/** Lokal, takrorlanmaydigan id. Brauzerda crypto.randomUUID bo‘lmasa, zaxira usul ishlatiladi. */
export function uid(prefix: string): string {
  counter += 1;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}
