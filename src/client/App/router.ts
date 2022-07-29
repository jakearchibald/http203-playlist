/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'preact/hooks';

import { usePageTransition } from 'client/utils';
import * as videoListStyles from 'shared/general/VideoList/styles.module.css';
import * as embedStyles from 'shared/Video/Embed/styles.module.css';

const enum TransitionType {
  Other,
  ThumbsToVideo,
  VideoToThumbs,
  VideoToVideo,
  ThumbsToThumbs,
}

const enum NavigationType {
  New,
  Back,
  Other,
}

function getNavigationType(event: NavigateEvent): NavigationType {
  if (event.navigationType === 'push' || event.navigationType === 'replace') {
    return NavigationType.New;
  }
  if (
    event.destination.index !== -1 &&
    event.destination.index < navigation.currentEntry!.index
  ) {
    return NavigationType.Back;
  }
  return NavigationType.Other;
}

interface TransitionData {
  transitionType: TransitionType;
  navigationType: NavigationType;
  from: string;
  to: string;
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
  const resetScrollOnNextRender = useRef(false);
  const elementsToUntag = useRef<HTMLElement[]>([]);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
    if (!resetScrollOnNextRender.current) return;
    resetScrollOnNextRender.current = false;
    scrollTo(0, 0);
  });

  let thumbnailRect: DOMRect | undefined;

  const startTransition = usePageTransition({
    outgoing() {
      const { navigationType, to, transitionType } = transitionData.current!;

      if (transitionType === TransitionType.ThumbsToVideo) {
        document.documentElement.classList.add('transition-home-to-video');
        const thumb = document.querySelector(
          `a[href="${to}"] .${videoListStyles.videoThumb}`,
        );

        if (thumb) {
          thumbnailRect = thumb.getBoundingClientRect();
          elementsToUntag.current.push(thumb as HTMLElement);
          (thumb as HTMLElement).style.pageTransitionTag = 'embed-container';
        }
      } else if (transitionType === TransitionType.VideoToThumbs) {
        document.documentElement.classList.add('transition-video-to-home');
      } else if (transitionType === TransitionType.VideoToVideo) {
        document.documentElement.classList.add('transition-video-to-video');
      }

      if (navigationType === NavigationType.Back) {
        document.documentElement.classList.add('back-transition');
      }
    },
    incoming() {
      const { from, transitionType } = transitionData.current!;

      if (transitionType === TransitionType.VideoToThumbs) {
        // Allow these to fall back to the first thumbnail
        const thumb =
          document.querySelector(
            `a[href="${from}"] .${videoListStyles.videoThumb}`,
          ) || document.querySelector(`.${videoListStyles.videoThumb}`);

        if (thumb) {
          elementsToUntag.current.push(thumb as HTMLElement);
          (thumb as HTMLElement).style.pageTransitionTag = 'embed-container';
        }
      }

      if (transitionType === TransitionType.ThumbsToVideo) {
        const fullEmbedRect = document
          .querySelector(`.${embedStyles.embedContainer}`)!
          .getBoundingClientRect();

        const scale = thumbnailRect!.width / fullEmbedRect.width;

        requestAnimationFrame(() => {
          document.documentElement.animate(
            [
              {
                width: `${innerWidth * scale}px`,
                height: `${innerHeight * scale}px`,
                transform: `translate(${
                  thumbnailRect!.left - fullEmbedRect.left * scale
                }px, ${thumbnailRect!.top - fullEmbedRect.top * scale}px)`,
              },
              {
                width: `${innerWidth}px`,
                height: `${innerHeight}px`,
                transform: `translate(0px, 0px)`,
              },
            ],
            {
              easing: 'cubic-bezier(0.8, 0, 0.6, 1)',
              duration: 300,
              fill: 'both',
              pseudoElement: '::page-transition-incoming-image(root)',
            },
          );
        });
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
      { type = NavigationType.New }: { type?: NavigationType } = {},
    ) => {
      if (from === to) return;

      // Hack so scroll restoration does the right thing
      await new Promise((r) => setTimeout(r, 0));

      if ('createDocumentTransition' in document) {
        transitionData.current = {
          from,
          to,
          navigationType: type,
          transitionType: getTransitionType(from, to),
        };
        await startTransition();
      }

      savedCallback.current(to);

      if (type === NavigationType.New) resetScrollOnNextRender.current = true;
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
              { type: getNavigationType(event) },
            ),
          );
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, [performTransition]);
}
