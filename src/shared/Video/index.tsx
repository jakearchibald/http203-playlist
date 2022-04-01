import { h, FunctionalComponent, RenderableProps, createRef } from 'preact';
import {} from 'preact/hooks';
import HeaderLayout from 'shared/general/HeaderLayout';
import VideoList from 'shared/general/VideoList';
import { formatDate } from 'shared/utils';

import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';
import Embed from './Embed';

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
}: RenderableProps<Props>) => {
  return (
    <HeaderLayout onHomeClick={onHomeClick} scrollKey={video.id} showBackIcon>
      <div class={styles.videoLayout}>
        <div class={styles.videoAndDetails}>
          <Embed video={video} key={video.id} />

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
