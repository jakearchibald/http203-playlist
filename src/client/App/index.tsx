import { h, FunctionalComponent, RenderableProps } from 'preact';
import { useState, useMemo, useCallback } from 'preact/hooks';
import Index from 'shared/Index';
import { cohosts } from 'shared/data';
import Video from 'shared/Video';
import { useRouter } from './router';

interface Props {
  videos: typeof import('video-data:').default;
}

function getCohostFromURL(path = location.pathname) {
  if (!path.startsWith('/with-')) return undefined;
  const cohost = /\/with-([^/]+)/.exec(path);
  if (!cohost) return undefined;
  return cohosts.find((name) => name.toLowerCase() === cohost[1]);
}

const App: FunctionalComponent<Props> = ({
  videos,
}: RenderableProps<Props>) => {
  const getVideoFromURL = useCallback(
    (path = location.pathname): typeof videos[string] | undefined => {
      const videoPrefix = '/videos/';
      let video: undefined | typeof videos[string];

      if (path.startsWith(videoPrefix)) {
        const slug = path.slice(videoPrefix.length, -1);
        video = videos[slug];
      }

      return video;
    },
    [videos],
  );

  const setStateFromURL = useCallback(
    (path = '/') => {
      setVideo(getVideoFromURL(path));
      setCohost(getCohostFromURL(path));
    },
    [getVideoFromURL],
  );

  useRouter(setStateFromURL);

  const initialVideo = useMemo(() => getVideoFromURL(), [getVideoFromURL]);
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
