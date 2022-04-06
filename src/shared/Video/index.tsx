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
}

const Video: FunctionalComponent<Props> = ({
  video,
  videos,
}: RenderableProps<Props>) => {
  return (
    <HeaderLayout scrollKey={video.id} showBackIcon>
      <div class={styles.videoLayout}>
        <div class={styles.videoAndDetails}>
          <Embed video={video} key={video.id} />

          <div class={[styles.videoDetails, 'video-details'].join(' ')}>
            <h1 class={styles.videoTitle}>{video.title}</h1>
            <time>{formatDate(new Date(video.published))}</time>
            <div
              class={styles.description}
              dangerouslySetInnerHTML={{ __html: video.description }}
            />
          </div>
        </div>
        <div class={[styles.scroller, 'related-videos'].join(' ')}>
          <VideoList videos={videos} />
        </div>
      </div>
    </HeaderLayout>
  );
};

export default Video;
