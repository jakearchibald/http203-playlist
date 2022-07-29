/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useEffect, useRef } from 'preact/hooks';

import { usePageTransition } from 'client/utils';

let lastClick: MouseEvent | undefined;
addEventListener('click', (event) => (lastClick = event));

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
      const x = lastClick?.clientX ?? innerWidth / 2;
      const y = lastClick?.clientY ?? innerHeight / 2;
      const endRadius = Math.sqrt(
        Math.max(x ** 2, (innerWidth - x) ** 2) +
          Math.max(y ** 2, (innerHeight - y) ** 2),
      );

      requestAnimationFrame(() => {
        document.documentElement.animate(
          [
            {
              clipPath: `circle(0 at ${x}px ${y}px)`,
            },
            {
              clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
            },
          ],
          {
            duration: 500,
            easing: 'ease-in',
            pseudoElement: '::page-transition-incoming-image(root)',
          },
        );
      });
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
