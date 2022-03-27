import { h, FunctionalComponent, RenderableProps, createRef } from 'preact';
import { useState } from 'preact/hooks';
import { ytSrcset } from 'shared/utils';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  video: typeof import('video-data:').default[string];
}

const Embed: FunctionalComponent<Props> = ({
  video,
}: RenderableProps<Props>) => {
  const [iframeReady, setIframeReady] = useState<boolean>(false);

  return (
    <div class={styles.embedContainer}>
      <iframe
        onLoad={() => setIframeReady(true)}
        class={styles.embed}
        width="560"
        height="315"
        src={`https://www.youtube-nocookie.com/embed/${video.id}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <img
        class={styles.videoImg}
        style={{ opacity: iframeReady ? '0' : '1' }}
        srcset={ytSrcset(video.id)}
        alt={video.title}
        // @ts-ignore
        fetchpriority="high"
      />
    </div>
  );
};

export default Embed;