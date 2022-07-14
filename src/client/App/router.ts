import { useCallback, useEffect, useLayoutEffect, useRef } from 'preact/hooks';

import { usePageTransition } from 'client/utils';

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

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useLayoutEffect(() => {
    if (!resetScrollOnNextRender.current) return;
    resetScrollOnNextRender.current = false;
    scrollTo(0, 0);
  });

  const startTransition = usePageTransition({
    outgoing() {
      const { navigationType, transitionType } = transitionData.current!;

      if (navigationType === NavigationType.Back) {
        document.documentElement.classList.add('back-transition');
      }

      if (transitionType === TransitionType.VideoToVideo) {
        document.documentElement.classList.add('video-to-video');
      } else if (transitionType === TransitionType.ThumbsToThumbs) {
        document.documentElement.classList.add('thumbs-to-thumbs');
      }
    },
    done() {
      document.documentElement.classList.remove(
        'back-transition',
        'video-to-video',
        'thumbs-to-thumbs',
      );
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
