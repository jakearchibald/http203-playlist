import { h, FunctionalComponent } from 'preact';
import {} from 'preact/hooks';
import HeaderLayout from 'shared/general/HeaderLayout';
import VideoList from 'shared/general/VideoList';
import { formatDate, ytSrcset } from 'shared/utils';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';

interface Props {
  videos: typeof import('video-data:').default;
  video: typeof import('video-data:').default[string];
  onHomeClick?: (event: Event) => void;
  onVideoClick?: (event: Event, url: string) => void;
}

const Video: FunctionalComponent<Props> = ({
  video,
  videos,
  onHomeClick,
  onVideoClick,
}: Props) => {
  return (
    <HeaderLayout onHomeClick={onHomeClick} scrollKey={video.id}>
      <div class={styles.videoLayout}>
        <div class={styles.videoAndDetails}>
          <div class={styles.embedContainer} key={video.id}>
            <img
              class={styles.videoImg}
              srcset={ytSrcset(video.id)}
              alt={video.title}
            />
            <iframe
              class={styles.embed}
              width="560"
              height="315"
              src={`https://www.youtube-nocookie.com/embed/${video.id}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div class={styles.videoDetails}>
            <h1 class={styles.videoTitle}>{video.title}</h1>
            <time>{formatDate(new Date(video.published))}</time>
            <div
              class={styles.description}
              dangerouslySetInnerHTML={{ __html: video.description }}
            />
          </div>
        </div>
        <div class={styles.scroller}>
          <VideoList videos={videos} onVideoClick={onVideoClick} />
        </div>
      </div>
    </HeaderLayout>
  );
};

export default Video;
