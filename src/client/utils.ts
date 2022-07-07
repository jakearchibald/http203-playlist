import { useRef, useEffect } from 'preact/hooks';

const reducedMotionMedia = matchMedia('(prefers-reduced-motion: reduce)');

interface UsePageTransitionArg {
  outgoing?(transition: DocumentTransition): void;
  incoming?(transition: DocumentTransition): void;
  done?(): void;
}

export function usePageTransition({
  outgoing,
  incoming,
  done,
}: UsePageTransitionArg = {}) {
  const startResolverRef = useRef<(value?: unknown) => void>();
  const outgoingRef = useRef(outgoing);
  const incomingRef = useRef(incoming);
  const doneRef = useRef(done);
  const transitionRef = useRef<DocumentTransition>();

  useEffect(() => {
    if (startResolverRef.current === undefined) return;
    incomingRef.current?.(transitionRef.current!);
    startResolverRef.current();
  });

  return async (): Promise<void> => {
    if (
      !('createDocumentTransition' in document) ||
      reducedMotionMedia.matches
    ) {
      return;
    }

    return new Promise<void>((resolve) => {
      const transition = document.createDocumentTransition();
      transitionRef.current = transition;
      outgoingRef.current?.(transition);

      globalThis.ongoingTransition = transition.start(async () => {
        resolve();

        await new Promise((resolve) => (startResolverRef.current = resolve));
      });

      globalThis.ongoingTransition
        .then(() => {
          globalThis.ongoingTransition = undefined;
          doneRef.current?.();
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    });
  };
}
