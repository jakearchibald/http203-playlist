import { h, FunctionalComponent } from 'preact';
import {} from 'preact/hooks';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';
import { formatDate, ytSrcset } from 'shared/utils';

interface Props {
  videos: typeof import('video-data:').default;
  onVideoClick?: (event: Event, url: string) => void;
}

const VideoList: FunctionalComponent<Props> = ({
  videos,
  onVideoClick,
}: Props) => {
  return (
    <ol class={styles.videoList}>
      {Object.entries(videos).map(([slug, video]) => (
        <li>
          <a
            class={styles.videoLink}
            href={`/videos/${slug}/`}
            onClick={(event) => onVideoClick?.(event, `/videos/${slug}/`)}
          >
            <img
              class={styles.videoThumb}
              srcset={ytSrcset(video.id)}
              alt={video.title}
            />
            <p class={styles.videoMeta}>
              <time>{formatDate(new Date(video.published))}</time>
            </p>
          </a>
        </li>
      ))}
    </ol>
  );
};

export default VideoList;
