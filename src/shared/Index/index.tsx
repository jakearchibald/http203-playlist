import { h, FunctionalComponent } from 'preact';
import {} from 'preact/hooks';
import HeaderLayout from 'shared/general/HeaderLayout';
import VideoList from 'shared/general/VideoList';
//import CohostSwitch from './CohostSwitch';

//import * as styles from './styles.module.css';

interface Props {
  videos: typeof import('video-data:').default;
  cohost?: typeof import('video-data:').default[string]['cohost'];
}

const Index: FunctionalComponent<Props> = ({ videos, cohost }: Props) => {
  let filteredVideos = videos;

  if (cohost) {
    filteredVideos = Object.fromEntries(
      Object.entries(videos).filter(([_, data]) => data.cohost === cohost),
    );
  }

  return (
    <HeaderLayout>
      <div>
        <VideoList videos={filteredVideos} />
      </div>
    </HeaderLayout>
  );
};

export default Index;
