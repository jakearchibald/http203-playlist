import { useRef, useEffect } from 'preact/hooks';

interface UsePageTransitionArg {
  outgoing?(transition: DocumentTransition): void;
  incoming?(transition: DocumentTransition): void;
}

export function usePageTransition() {
  const startResolver = useRef<(value?: unknown) => void>();
  const transitionRef = useRef<DocumentTransition>();
  const incomingRef = useRef<UsePageTransitionArg['incoming']>();

  useEffect(() => {
    const resolver = startResolver.current;
    if (resolver === undefined) return;
    incomingRef.current?.(transitionRef.current!);
    startResolver.current = undefined;
    resolver();
  });

  return async ({
    outgoing,
    incoming,
  }: UsePageTransitionArg = {}): Promise<void> => {
    if (!('createDocumentTransition' in document)) return;

    document.documentElement.classList.add('transition-warming-up');

    return new Promise<void>(async (resolve) => {
      const transition = document.createDocumentTransition();
      transitionRef.current = transition;
      incomingRef.current = incoming;
      outgoing?.(transition);

      globalThis.ongoingTransition = transition.start(async () => {
        resolve();
        await new Promise((resolve) => {
          startResolver.current = resolve;
        });

        document.documentElement.classList.remove('transition-warming-up');
      });

      await globalThis.ongoingTransition;

      globalThis.ongoingTransition = undefined;
    });
  };
}
