import { useEffect, useState } from 'react';

/** localStorage bilan sinxron state. Xato bo‘lsa boshlang‘ich qiymatga qaytadi. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* saqlash imkoni bo‘lmasa, jim o‘tamiz */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
