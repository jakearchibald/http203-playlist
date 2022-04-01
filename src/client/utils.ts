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

    return new Promise<void>((resolve) => {
      const transition = document.createDocumentTransition();
      transitionRef.current = transition;
      incomingRef.current = incoming;
      outgoing?.(transition);

      transition.start(async () => {
        resolve();
        await new Promise((resolve) => {
          startResolver.current = resolve;
        });
      });
    });
  };
}
