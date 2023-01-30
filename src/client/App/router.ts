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

const pageTypeClassNames = {
  [PageType.Thumbs]: 'thumbs',
  [PageType.Video]: 'video',
  [PageType.Unknown]: 'unknown',
} as const;

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

function createTransform(from: DOMRect, to: DOMRect): string {
  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;
  const translateX = to.left - from.left;
  const translateY = to.top - from.top;

  return new DOMMatrix()
    .scale(scaleX, scaleY)
    .translate(translateX / scaleX, translateY / scaleY)
    .toString();
}

/*function getSnapshotRootHeightDiff(): number {
  // This is a hack, and assumes that the difference between the
  // IDB and the snapshot root is just the URL bar.
  // This won't work if the URL bar state is different between the before/after views
  // or if a virtual keyboard was used.
  const rootHeight = parseFloat(
    getComputedStyle(document.documentElement, '::view-transition').height,
  );
  return rootHeight - innerHeight;
}*/

export function useRouter(callback: (newURL: string) => void) {
  const savedCallback = useRef(callback);
  const elementsToUntag = useRef<HTMLElement[]>([]);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  let thumbnailRect: DOMRect | undefined;
  let fullEmbedRect: DOMRect | undefined;

  const startTransition = usePageTransition<TransitionData>({
    beforeChange({ to, fromType, toType }) {
      if (fromType === PageType.Thumbs && toType === PageType.Video) {
        const thumbLink = document.querySelector<HTMLElement>(
          `a[href="${to}"]`,
        );

        if (thumbLink) {
          const thumb = thumbLink.querySelector(
            `.${videoListStyles.videoThumb}`,
          );
          thumbnailRect = thumb!.getBoundingClientRect();
          elementsToUntag.current.push(thumbLink);
          thumbLink.style.viewTransitionName = 'embed-container';
        }
      } else if (fromType === PageType.Video && toType === PageType.Thumbs) {
        fullEmbedRect = document
          .querySelector(`.${embedStyles.embedContainer}`)!
          .getBoundingClientRect();
      }
    },
    afterChange({ from, fromType, toType }, viewTransition) {
      if (fromType === PageType.Video && toType === PageType.Thumbs) {
        // Allow these to fall back to the first thumbnail
        const thumbLink =
          document.querySelector<HTMLElement>(`a[href="${from}"]`) ||
          document.querySelector<HTMLElement>(`.${videoListStyles.videoLink}`);

        const thumb = thumbLink!.querySelector(
          `.${videoListStyles.videoThumb}`,
        );

        elementsToUntag.current.push(thumbLink!);
        thumbLink!.style.viewTransitionName = 'embed-container';

        viewTransition.ready
          .then(async () => {
            // For some horrible reason, scroll positions aren't updated
            // until after a microtask.
            await Promise.resolve();
            thumbnailRect = thumb!.getBoundingClientRect();

            document.documentElement.animate(
              [
                {
                  transform: `translate(0px, 0px)`,
                },
                {
                  transform: createTransform(fullEmbedRect!, thumbnailRect),
                },
              ],
              {
                easing: 'cubic-bezier(0.8, 0, 0.6, 1)',
                duration: 250,
                fill: 'both',
                pseudoElement: '::view-transition-old(root)',
              },
            );
          })
          .catch(() => undefined);
      } else if (fromType === PageType.Thumbs && toType === PageType.Video) {
        viewTransition.ready
          .then(async () => {
            // For some horrible reason, scroll positions aren't updated
            // until after a microtask.
            await Promise.resolve();

            fullEmbedRect = document
              .querySelector(`.${embedStyles.embedContainer}`)!
              .getBoundingClientRect();

            /*const heightDiff = getSnapshotRootHeightDiff();
            console.log(heightDiff);*/

            document.documentElement.animate(
              [
                {
                  transform: createTransform(fullEmbedRect, thumbnailRect!),
                },
                {
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
          })
          .catch(() => undefined);
      }
    },
    done() {
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

      const fromType = getPageType(from);
      const toType = getPageType(to);

      await startTransition({
        classNames: [
          `from-${pageTypeClassNames[fromType]}`,
          `to-${pageTypeClassNames[toType]}`,
          type === NavigationType.Back && 'back-transition',
        ].filter(Boolean) as string[],
        data: {
          from,
          fromType,
          to,
          toType,
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
            scroll: 'manual',
            async handler() {
              await performTransition(currentPath, destinationURL.pathname, {
                type: getNavigationType(event),
              });
              await (globalThis.ongoingTransition!.domUpdated ||
                globalThis.ongoingTransition!.updateCallbackDone);

              event.scroll();

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
