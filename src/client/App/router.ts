/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useCallback, useEffect, useRef } from 'preact/hooks';

import { usePageTransition } from 'shared/utils';
import * as videoListStyles from 'shared/general/VideoList/styles.module.css';
import * as embedStyles from 'shared/Video/Embed/styles.module.css';

const enum PageType {
  Thumbs,
  Video,
  Unknown,
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
  navigationType: NavigationType;
  from: string;
  fromType: PageType;
  to: string;
  toType: PageType;
}

function getPageType(url: string): PageType {
  if (url === '/' || url.startsWith('/with-')) return PageType.Thumbs;
  if (url.startsWith('/videos/')) return PageType.Video;
  return PageType.Unknown;
}

export function useRouter(callback: (newURL: string) => void) {
  const savedCallback = useRef(callback);
  const elementsToUntag = useRef<HTMLElement[]>([]);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  let thumbnailRect: DOMRect | undefined;
  let fullEmbedRect: DOMRect | undefined;

  const startTransition = usePageTransition<TransitionData>({
    beforeChange({ navigationType, to, fromType, toType }) {
      if (fromType === PageType.Thumbs && toType === PageType.Video) {
        document.documentElement.classList.add('transition-home-to-video');
        const thumbLink = document.querySelector(`a[href="${to}"]`);

        if (thumbLink) {
          const thumb = thumbLink.querySelector(
            `.${videoListStyles.videoThumb}`,
          );
          thumbnailRect = thumb!.getBoundingClientRect();
          elementsToUntag.current.push(thumbLink as HTMLElement);
          (thumbLink as HTMLElement).style.viewTransitionName =
            'embed-container';
        }
      } else if (fromType === PageType.Video && toType === PageType.Thumbs) {
        document.documentElement.classList.add('transition-video-to-home');
        fullEmbedRect = document
          .querySelector(`.${embedStyles.embedContainer}`)!
          .getBoundingClientRect();
      } else if (fromType === PageType.Video && toType === PageType.Video) {
        document.documentElement.classList.add('transition-video-to-video');
      }

      if (navigationType === NavigationType.Back) {
        document.documentElement.classList.add('back-transition');
      }
    },
    afterChange({ from, fromType, toType }) {
      if (fromType === PageType.Video && toType === PageType.Thumbs) {
        // Allow these to fall back to the first thumbnail
        const thumbLink =
          document.querySelector(`a[href="${from}"]`) ||
          document.querySelector(`.${videoListStyles.videoThumb}`);
        const thumb = thumbLink!.querySelector(
          `.${videoListStyles.videoThumb}`,
        );

        thumbnailRect = thumb!.getBoundingClientRect();

        elementsToUntag.current.push(thumbLink as HTMLElement);
        (thumbLink as HTMLElement).style.viewTransitionName = 'embed-container';

        const scale = thumbnailRect.width / fullEmbedRect!.width;

        requestAnimationFrame(() => {
          document.documentElement.animate(
            [
              {
                width: `${innerWidth}px`,
                height: `${innerHeight}px`,
                transform: `translate(0px, 0px)`,
              },
              {
                width: `${innerWidth * scale}px`,
                height: `${innerHeight * scale}px`,
                transform: `translate(${
                  thumbnailRect!.left - fullEmbedRect!.left * scale
                }px, ${thumbnailRect!.top - fullEmbedRect!.top * scale}px)`,
              },
            ],
            {
              easing: 'cubic-bezier(0.8, 0, 0.6, 1)',
              duration: 250,
              fill: 'both',
              pseudoElement: '::view-transition-old(root)',
            },
          );
        });
      } else if (fromType === PageType.Thumbs && toType === PageType.Video) {
        fullEmbedRect = document
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
                  thumbnailRect!.left - fullEmbedRect!.left * scale
                }px, ${thumbnailRect!.top - fullEmbedRect!.top * scale}px)`,
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
              pseudoElement: '::view-transition-new(root)',
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
        element.style.viewTransitionName = '';
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

      await startTransition({
        data: {
          from,
          fromType: getPageType(from),
          to,
          toType: getPageType(to),
          navigationType: type,
        },
      });

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
        if (!event.canIntercept) return;

        const currentPath = new URL(navigation.currentEntry!.url!).pathname;
        const destinationURL = new URL(event.destination.url);

        if (
          destinationURL.pathname === '/' ||
          destinationURL.pathname.startsWith('/with-') ||
          destinationURL.pathname.startsWith('/videos/')
        ) {
          event.intercept({
            async handler() {
              await performTransition(currentPath, destinationURL.pathname, {
                type: getNavigationType(event),
              });
              await (globalThis.ongoingTransition!.domUpdated ||
                globalThis.ongoingTransition!.updateCallbackDone);
              if (
                event.navigationType === 'push' ||
                event.navigationType === 'replace'
              ) {
                window.scrollTo(0, 0);
              }
            },
          });
        }
      },
      { signal: controller.signal },
    );

    return () => controller.abort();
  }, [performTransition]);
}
