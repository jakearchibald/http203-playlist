import { usePageTransition } from 'client/utils';
import { h, FunctionalComponent, RenderableProps } from 'preact';
import { useState, useMemo, useEffect } from 'preact/hooks';
import Index from 'shared/Index';
import { cohosts } from 'shared/data';
import Video from 'shared/Video';
import * as videoListStyles from 'shared/general/VideoList/styles.module.css';
import * as videoEmbedStyles from 'shared/Video/Embed/styles.module.css';
import * as videoStyles from 'shared/Video/styles.module.css';

const enum TransitionType {
  Other,
  ThumbsToVideo,
  VideoToThumbs,
  VideoToVideo,
  ThumbsToThumbs,
}

interface Props {
  videos: typeof import('video-data:').default;
}

const App: FunctionalComponent<Props> = ({
  videos,
}: RenderableProps<Props>) => {
  function getVideoFromURL(
    path = location.pathname,
  ): typeof videos[string] | undefined {
    const videoPrefix = '/videos/';
    let video: undefined | typeof videos[string] = undefined;

    if (path.startsWith(videoPrefix)) {
      const slug = path.slice(videoPrefix.length, -1);
      video = videos[slug];
    }

    return video;
  }

  function getCohostFromURL(path = location.pathname) {
    if (!path.startsWith('/with-')) return undefined;
    const cohost = /\/with-([^\/]+)/.exec(path);
    if (!cohost) return undefined;
    return cohosts.find((name) => name.toLowerCase() === cohost[1]);
  }

  function setStateFromURL(path: string = '/') {
    setVideo(getVideoFromURL(path));
    setCohost(getCohostFromURL(path));
  }

  async function performTransition(
    from: string,
    to: string,
    { back = false }: { back?: boolean } = {},
  ) {
    if (from === to) return;

    const transitionType: TransitionType = (() => {
      if (
        to.startsWith('/videos/') &&
        (from === '/' || from.startsWith('/with-'))
      ) {
        return TransitionType.ThumbsToVideo;
      }
      if (
        from.startsWith('/videos/') &&
        (to === '/' || to.startsWith('/with-'))
      ) {
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
    })();

    const elementsToUntag: HTMLElement[] = [];

    await startTransition({
      outgoing() {
        if (transitionType === TransitionType.ThumbsToVideo) {
          document.documentElement.classList.add('transition-home-to-video');
          const thumb = document.querySelector(
            `a[href="${to}"] .${videoListStyles.videoThumb}`,
          );
          const details = document.querySelector(
            `a[href="${to}"] .${videoListStyles.videoMeta}`,
          );

          if (thumb && details) {
            elementsToUntag.push(thumb as HTMLElement, details as HTMLElement);
            (thumb as HTMLElement).style.pageTransitionTag = 'embed-container';
            (details as HTMLElement).style.pageTransitionTag = 'video-details';
          }
        } else if (transitionType === TransitionType.VideoToThumbs) {
          document.documentElement.classList.add('transition-video-to-home');
        } else if (transitionType === TransitionType.VideoToVideo) {
          document.documentElement.classList.add('transition-video-to-video');

          const embed = document.querySelector(
            `.${videoEmbedStyles.embedContainer}`,
          );
          const details = document.querySelector(
            `.${videoStyles.videoDetails}`,
          );

          if (embed && details) {
            elementsToUntag.push(embed as HTMLElement, details as HTMLElement);
            (embed as HTMLElement).style.pageTransitionTag = 'none';
            (details as HTMLElement).style.pageTransitionTag = 'none';
          }
        }

        if (back) {
          document.documentElement.classList.add('back-transition');
        }
      },
      incoming() {
        if (transitionType === TransitionType.VideoToThumbs) {
          const thumb = document.querySelector(
            `a[href="${from}"] .${videoListStyles.videoThumb}`,
          );
          const details = document.querySelector(
            `a[href="${from}"] .${videoListStyles.videoMeta}`,
          );

          if (thumb && details) {
            elementsToUntag.push(thumb as HTMLElement, details as HTMLElement);
            (thumb as HTMLElement).style.pageTransitionTag = 'embed-container';
            (details as HTMLElement).style.pageTransitionTag = 'video-details';
          }
        } else if (transitionType === TransitionType.VideoToVideo) {
          document.documentElement.classList.add('transition-video-to-video');

          const embed = document.querySelector(
            `.${videoEmbedStyles.embedContainer}`,
          );
          const details = document.querySelector(
            `.${videoStyles.videoDetails}`,
          );

          if (embed && details) {
            elementsToUntag.push(embed as HTMLElement, details as HTMLElement);
            (embed as HTMLElement).style.pageTransitionTag = 'none';
            (details as HTMLElement).style.pageTransitionTag = 'none';
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

        while (elementsToUntag.length) {
          const element = elementsToUntag.pop()!;
          element.style.pageTransitionTag = '';
        }
      },
    });

    setStateFromURL(to);
  }

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
  }, []);

  const startTransition = usePageTransition();
  const initialVideo = useMemo(() => getVideoFromURL(), []);
  const initialCohost = useMemo(() => getCohostFromURL(), []);

  const [video, setVideo] = useState<
    undefined | typeof import('video-data:').default[string]
  >(initialVideo);

  const [cohost, setCohost] = useState<
    undefined | typeof import('shared/data').cohosts[number]
  >(initialCohost);

  if (video) {
    return <Video video={video} videos={videos} />;
  }

  return <Index videos={videos} cohost={cohost} />;
};
export default App;
