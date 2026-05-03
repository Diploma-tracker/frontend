import { useEffect, useRef } from 'react';

const DEFAULT_DELAY = 500;

//TODO: rewrite to this one in code
//TODO: https://streamich.github.io/react-use/?path=/story/side-effects-usedebounce--docs
export function useDebounce(
  fn: () => void,
  deps: unknown[],
  delay: number = DEFAULT_DELAY,
) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const timer = setTimeout(() => fnRef.current(), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
