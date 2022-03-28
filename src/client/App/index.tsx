import { usePageTransition } from 'client/utils';
import { h, FunctionalComponent, RenderableProps } from 'preact';
import { useState, useMemo, useEffect } from 'preact/hooks';
import Index from 'shared/Index';
import Video from 'shared/Video';

interface Props {
  videos: typeof import('video-data:').default;
}

const App: FunctionalComponent<Props> = ({
  videos,
}: RenderableProps<Props>) => {
  function getVideoFromURL(): typeof videos[string] | undefined {
    const path = location.pathname;
    const videoPrefix = '/videos/';
    let video: undefined | typeof videos[string] = undefined;

    if (path.startsWith(videoPrefix)) {
      const slug = path.slice(videoPrefix.length, -1);
      video = videos[slug];
    }

    return video;
  }

  function setStateFromURL() {
    setVideo(getVideoFromURL());
  }

  async function navigateTo(path: string) {
    const currentPath = location.pathname;

    if (path === currentPath) return;

    const elementsToSet = [
      ['.site-header', 'header'],
      ['.header-text', 'header-text'],
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
        if (path === '/') {
          document.documentElement.classList.add('back-transition');
        }

        setElements(transition);

        if (currentPath === '/' && path.startsWith('/videos/')) {
          transition.setElement(
            document.querySelector(`a[href="${path}"] .video-thumb`)!,
            'embed-container',
          );
        }
      },
      incoming(transition) {
        setElements(transition);

        if (currentPath === '/' && path.startsWith('/videos/')) {
          transition.setElement(
            document.querySelector(`.embed-container`)!,
            'embed-container',
          );
        }
      },
      done() {
        document.documentElement.classList.remove('back-transition');
      },
    });
    history.pushState(null, '', path);
    setStateFromURL();
  }

  function onHomeClick(event: Event) {
    event.preventDefault();
    navigateTo('/');
  }

  function onVideoClick(event: Event, path: string) {
    event.preventDefault();
    navigateTo(path);
  }

  const startTransition = usePageTransition();
  const initialVideo = useMemo(() => getVideoFromURL(), []);

  const [video, setVideo] = useState<
    undefined | typeof import('video-data:').default[string]
  >(initialVideo);

  useEffect(() => {
    const onPopState = () => setStateFromURL();
    addEventListener('popstate', onPopState);
    return () => removeEventListener('popstate', onPopState);
  }, []);

  if (video) {
    return (
      <Video
        video={video}
        videos={videos}
        onHomeClick={onHomeClick}
        onVideoClick={onVideoClick}
      />
    );
  }

  return (
    <Index
      videos={videos}
      onHomeClick={onHomeClick}
      onVideoClick={onVideoClick}
    />
  );
};
export default App;
