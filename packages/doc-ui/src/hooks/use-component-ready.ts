import { useLayoutEffect, useRef, useState } from 'react';

interface UseComponentReady {
  enabled?: boolean;
  key?: React.Key;
}

const cache = new Set<React.Key>();

export function useComponentReady<T extends HTMLElement = HTMLElement>({ enabled, key }: UseComponentReady = {}) {
  const ref = useRef<T>(null);

  const [ready, setReady] = useState(() => {
    if (key) {
      return cache.has(key);
    }
    return !enabled;
  });

  useLayoutEffect(() => {
    if (!('IntersectionObserver' in globalThis)) {
      setReady(true);
      return;
    }
    if (!enabled || (key && cache.has(key))) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setReady(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: [0.1, 1],
      },
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [enabled, key]);

  return [ref, ready] as const;
}
