import { useState, useEffect } from 'react';

export function usePoll(fetchFn, intervalMs = 5000) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        const result = await fetchFn();
        if (alive) setData(result);
      } catch (_) {}
    };

    run();
    const id = setInterval(run, intervalMs);
    return () => { alive = false; clearInterval(id); };
  }, [intervalMs]);

  return data;
}
