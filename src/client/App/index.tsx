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
    await startTransition();
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
