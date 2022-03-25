import { h, FunctionalComponent } from 'preact';
import {} from 'preact/hooks';
import HeaderLayout from 'shared/general/HeaderLayout';
import VideoList from 'shared/general/VideoList';

//import * as styles from './styles.module.css';

interface Props {
  videos: typeof import('video-data:').default;
}

const Index: FunctionalComponent<Props> = ({ videos }: Props) => {
  return (
    <HeaderLayout>
      <VideoList videos={videos} />
    </HeaderLayout>
  );
};

export default Index;
