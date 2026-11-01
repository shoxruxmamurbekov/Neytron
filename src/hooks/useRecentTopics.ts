import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MAX = 5;

/** So‘nggi ko‘rilgan o‘quv mavzulari (slug ro‘yxati). */
export function useRecentTopics() {
  const [recent, setRecent] = useLocalStorage<string[]>('neytron.recent', []);

  const markViewed = useCallback(
    (slug: string) => {
      setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX));
    },
    [setRecent],
  );

  return { recent, markViewed };
}
