import { h, FunctionalComponent, RenderableProps } from 'preact';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';
import { ytSrcset } from 'static-build/utils';

interface Props {
  video: typeof import('video-data:').default[string];
}

const Embed: FunctionalComponent<Props> = ({
  video,
}: RenderableProps<Props>) => {
  return (
    <div class={styles.embedContainer}>
      <iframe
        class={styles.embed}
        width="560"
        height="315"
        src={`https://www.youtube-nocookie.com/embed/${video.id}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <img
        class={styles.videoImg}
        srcset={ytSrcset(video.id)}
        alt={video.title}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fetchpriority="high"
      />
    </div>
  );
};

export default Embed;
