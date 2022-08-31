import { useCallback, useEffect, useRef } from 'preact/hooks';

import { usePageTransition } from 'client/utils';
import * as videoListStyles from 'shared/general/VideoList/styles.module.css';

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
  const elementsToUntag = useRef<HTMLElement[]>([]);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const startTransition = usePageTransition({
    outgoing() {
      const { back, to, type } = transitionData.current!;

      if (type === TransitionType.ThumbsToVideo) {
        document.documentElement.classList.add('transition-home-to-video');
        const thumb = document.querySelector(
          `a[href="${to}"] .${videoListStyles.videoThumb}`,
        );
        const details = document.querySelector(
          `a[href="${to}"] .${videoListStyles.videoMeta}`,
        );

        if (thumb && details) {
          elementsToUntag.current.push(
            thumb as HTMLElement,
            details as HTMLElement,
          );
          (thumb as HTMLElement).style.pageTransitionTag = 'embed-container';
          (details as HTMLElement).style.pageTransitionTag = 'video-details';
        }
      } else if (type === TransitionType.VideoToThumbs) {
        document.documentElement.classList.add('transition-video-to-home');
      } else if (type === TransitionType.VideoToVideo) {
        document.documentElement.classList.add('transition-video-to-video');
      }

      if (back) document.documentElement.classList.add('back-transition');
    },
    incoming() {
      const { from, type } = transitionData.current!;

      if (type === TransitionType.VideoToThumbs) {
        // Allow these to fall back to the first thumbnail
        const thumb =
          document.querySelector(
            `a[href="${from}"] .${videoListStyles.videoThumb}`,
          ) || document.querySelector(`.${videoListStyles.videoThumb}`);

        const details =
          document.querySelector(
            `a[href="${from}"] .${videoListStyles.videoMeta}`,
          ) || document.querySelector(`.${videoListStyles.videoMeta}`);

        if (thumb && details) {
          elementsToUntag.current.push(
            thumb as HTMLElement,
            details as HTMLElement,
          );
          (thumb as HTMLElement).style.pageTransitionTag = 'embed-container';
          (details as HTMLElement).style.pageTransitionTag = 'video-details';
        }
      }
    },
    done() {
      document.documentElement.classList.remove(
        'back-transition',
        'transition-home-to-video',
        'transition-video-to-home',
        'transition-video-to-video',
      );

      while (elementsToUntag.current.length) {
        const element = elementsToUntag.current.pop()!;
        element.style.pageTransitionTag = '';
      }
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

      await new Promise((r) => setTimeout(r, 300));
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
