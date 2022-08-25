import { useRef, useEffect } from 'preact/hooks';

const ytImageSizes: [width: number, urlPart: string][] = [
  [320, 'mq'],
  [480, 'hq'],
  [640, 'sd'],
  [1280, 'maxres'],
];

export const ytSrcset = (id: string): string =>
  ytImageSizes
    .map(
      ([width, urlPart]) =>
        `https://i.ytimg.com/vi/${id}/${urlPart}default.jpg ${width}w`,
    )
    .join(', ');

export const formatDate = (date: Date) =>
  `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function animateTo(
  element: HTMLElement,
  to: Keyframe[] | PropertyIndexedKeyframes,
  options: KeyframeAnimationOptions,
) {
  const anim = element.animate(to, { ...options, fill: 'both' });
  anim.addEventListener('finish', () => {
    anim.commitStyles();
    anim.cancel();
  });
  return anim;
}
const reducedMotionMedia = __PRERENDER__
  ? null
  : matchMedia('(prefers-reduced-motion: reduce)');

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
    startResolverRef.current = undefined;
  });

  return async (): Promise<void> => {
    if (
      !('createDocumentTransition' in document) ||
      reducedMotionMedia!.matches
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
