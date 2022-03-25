import { h, FunctionalComponent } from 'preact';
import {} from 'preact/hooks';
import HeaderLayout from 'shared/general/HeaderLayout';
import VideoList from 'shared/general/VideoList';

//import * as styles from './styles.module.css';

interface Props {
  videos: typeof import('video-data:').default;
  onHomeClick?: (event: Event) => void;
  onVideoClick?: (event: Event, url: string) => void;
}

const Index: FunctionalComponent<Props> = ({
  videos,
  onHomeClick,
  onVideoClick,
}: Props) => {
  return (
    <HeaderLayout onHomeClick={onHomeClick}>
      <VideoList videos={videos} onVideoClick={onVideoClick} />
    </HeaderLayout>
  );
};

export default Index;
