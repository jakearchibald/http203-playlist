import { usePageTransition } from 'client/utils';
import { h, FunctionalComponent, RenderableProps } from 'preact';
import { useState, useMemo, useEffect } from 'preact/hooks';
import Index from 'shared/Index';
import { cohosts } from 'shared/data';
import Video from 'shared/Video';

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

    const toVideo =
      to.startsWith('/videos/') && (from === '/' || from.startsWith('/with-'));

    const elementsToSet = [
      ['.site-header', 'header'],
      ['.cohost-switch', 'cohost-switch'],
      ['.header-text', 'header-text'],
      ['.related-videos', 'related-videos'],
    ];

    function setElements(transition: DocumentTransition) {
      for (const [selector, tag] of elementsToSet) {
        const element = document.querySelector(selector);
        if (!element) continue;
        transition.setElement(element, tag);
      }
    }

    await startTransition({
      outgoing(transition) {
        if (toVideo) {
          document.documentElement.classList.add('transition-to-video');
        } else if (to === '/') {
          document.documentElement.classList.add('transition-to-home');
        }

        if (back) {
          document.documentElement.classList.add('back-transition');
        }

        setElements(transition);

        if (toVideo) {
          transition.setElement(
            document.querySelector(`a[href="${to}"] .video-thumb`)!,
            'embed-container',
          );
          transition.setElement(
            document.querySelector(`a[href="${to}"] .video-meta`)!,
            'video-details',
          );
        }
      },
      incoming(transition) {
        setElements(transition);

        if (toVideo) {
          transition.setElement(
            document.querySelector(`.embed-container`)!,
            'embed-container',
          );
          transition.setElement(
            document.querySelector(`.video-details`)!,
            'video-details',
          );
        }
      },
      done() {
        document.documentElement.classList.remove(
          'back-transition',
          'transition-to-video',
          'transition-to-home',
        );
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
