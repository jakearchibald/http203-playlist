import { useCallback, useEffect, useRef } from 'preact/hooks';

import { usePageTransition } from 'client/utils';

function createStarPath({
  points,
  x,
  y,
  scale,
}: {
  points: number;
  x: number;
  y: number;
  scale: number;
}): string {
  const star = Array.from({ length: points }, (_, i) => {
    return new DOMMatrix()
      .translate(x, y)
      .scale(scale)
      .rotate((i / points) * 360)
      .translate(0, i % 2 ? -1 : -2)
      .transformPoint(new DOMPoint());
  });

  return star
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

const enum TransitionType {
  Other,
  ThumbsToVideo,
  VideoToThumbs,
  VideoToVideo,
  ThumbsToThumbs,
}

interface TransitionData {
  type: TransitionType;
  from: string;
  to: string;
  back: boolean;
}

function getTransitionType(from: string, to: string): TransitionType {
  if (
    to.startsWith('/videos/') &&
    (from === '/' || from.startsWith('/with-'))
  ) {
    return TransitionType.ThumbsToVideo;
  }
  if (from.startsWith('/videos/') && (to === '/' || to.startsWith('/with-'))) {
    return TransitionType.VideoToThumbs;
  }
  if (
    (from === '/' || from.startsWith('/with-')) &&
    (to === '/' || to.startsWith('/with-'))
  ) {
    return TransitionType.ThumbsToThumbs;
  }
  if (from.startsWith('/videos/') && to.startsWith('/videos/')) {
    return TransitionType.VideoToVideo;
  }
  return TransitionType.Other;
}

export function useRouter(callback: (newURL: string) => void) {
  const savedCallback = useRef(callback);
  const transitionData = useRef<TransitionData>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const startTransition = usePageTransition({
    incoming() {
      const points = 10;
      const x = innerWidth / 2;
      const y = innerHeight / 2;
      const endScale = Math.max(x, y);

      document.documentElement.animate(
        [
          {
            clipPath: `path("${createStarPath({
              points,
              x,
              y,
              scale: 1,
            })}")`,
          },
          {
            clipPath: `path("${createStarPath({
              points,
              x,
              y,
              scale: endScale,
            })}")`,
          },
        ],
        {
          duration: 1000,
          pseudoElement: '::page-transition-container(root)',
        },
      );
    },
  });

  const performTransition = useCallback(
    async (
      from: string,
      to: string,
      { back = false }: { back?: boolean } = {},
    ) => {
      if (from === to) return;

      transitionData.current = {
        from,
        to,
        back,
        type: getTransitionType(from, to),
      };
      await startTransition();
      savedCallback.current(to);
    },
    [startTransition],
  );

  useEffect(() => {
    if (!self.navigation) return;

    const controller = new AbortController();

    navigation.addEventListener(
      'navigate',
      (event) => {
        if (!event.canTransition) return;

        const destinationURL = new URL(event.destination.url);

        if (
          destinationURL.pathname === '/' ||
          destinationURL.pathname.startsWith('/with-') ||
          destinationURL.pathname.startsWith('/videos/')
        ) {
          event.transitionWhile(
            performTransition(
              new URL(navigation.currentEntry!.url!).pathname,
              destinationURL.pathname,
              {
                back:
                  event.destination.index !== -1 &&
                  event.destination.index < navigation.currentEntry!.index,
              },
            ),
          );
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, [performTransition]);
}
