import { useState, useEffect } from 'react';
import { searchIndex } from '../data/searchIndex';

function scoreItem(item, query) {
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();
  const body = item.body.toLowerCase();
  if (title === q) return 3;
  if (title.startsWith(q)) return 2;
  if (title.includes(q) || body.includes(q)) return 1;
  return 0;
}

export function useSearch(query) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      const scored = searchIndex
        .map((item) => ({ ...item, _score: scoreItem(item, query) }))
        .filter((item) => item._score > 0)
        .sort((a, b) => b._score - a._score);

      // Group by section, max 4 per section
      const groups = {};
      scored.forEach((item) => {
        if (!groups[item.section]) groups[item.section] = [];
        if (groups[item.section].length < 4) groups[item.section].push(item);
      });

      setResults(
        Object.entries(groups).map(([section, items]) => ({ section, items }))
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return results;
}
