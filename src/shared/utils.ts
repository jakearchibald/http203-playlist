import { useRef, useEffect, useLayoutEffect } from 'preact/hooks';

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

interface UsePageTransitionArg<DataType> {
  beforeChange?(data: DataType, transition: ViewTransition): void;
  afterChange?(data: DataType, transition: ViewTransition): void;
  done?(data: DataType): void;
}

interface StartTransitionOptions<DataType> {
  classNames?: string[];
  data?: DataType;
}

export function usePageTransition<DataType = undefined>({
  beforeChange,
  afterChange,
  done,
}: UsePageTransitionArg<DataType> = {}) {
  const startResolverRef = useRef<(value?: unknown) => void>();
  const beforeChangeRef = useRef(beforeChange);
  const afterChangeRef = useRef(afterChange);
  const doneRef = useRef(done);
  const dataRef = useRef<DataType>();
  const transitionRef = useRef<ViewTransition>();

  useLayoutEffect(() => {
    if (startResolverRef.current === undefined) return;
    afterChangeRef.current?.(dataRef.current!, transitionRef.current!);
    startResolverRef.current();
    startResolverRef.current = undefined;
  });

  return async ({
    classNames = [],
    data,
  }: StartTransitionOptions<DataType>): Promise<void> => {
    if (!('startViewTransition' in document) || reducedMotionMedia!.matches) {
      return;
    }

    return new Promise<void>((resolve) => {
      dataRef.current = data;
      document.documentElement.classList.add(...classNames);

      const transition = document.startViewTransition(async () => {
        resolve();
        // Wait for next update
        await new Promise((resolve) => (startResolverRef.current = resolve));
      });

      transitionRef.current = transition;
      beforeChangeRef.current?.(data!, transition);

      globalThis.ongoingTransition = transition;

      transition.finished
        .finally(() => {
          globalThis.ongoingTransition = undefined;
          document.documentElement.classList.remove(...classNames);
          doneRef.current?.(data!);
        })
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    });
  };
}
