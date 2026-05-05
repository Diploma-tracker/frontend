import { useRef } from 'react';
import { useDebounce as useReactUseDebounce } from 'react-use';

const DEFAULT_DELAY = 300;

interface DebounceOptions {
  /**
   * Whether to invoke the function on the first render. If set to `true`, the function will be called immediately on the first render, and then debounced for subsequent calls.
   * @default false
   */
  invokeOnStart?: boolean;
}

export function useDebounce(
  fn: () => void,
  deps: unknown[],
  delay: number = DEFAULT_DELAY,
  options: DebounceOptions = {},
) {
  const { invokeOnStart = false } = options;

  const isFirstRender = useRef(true);

  const [isReady, cancel] = useReactUseDebounce(
    () => {
      if (isFirstRender.current) {
        isFirstRender.current = false;

        if (!invokeOnStart) {
          return;
        }
      }

      fn();
    },
    delay,
    deps,
  );

  return [isReady, cancel] as const;
}
