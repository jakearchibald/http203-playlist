/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { h, FunctionalComponent } from 'preact';
import CommonHead from '../CommonHead';
import pageData from 'video-data:';
import * as styles from './styles.module.css';
import 'add-css:./styles.module.css';
import HeaderLayout from '../general/HeaderLayout';
import Embed from './Embed';
import { formatDate } from 'static-build/utils';
import VideoList from '../general/VideoList';

interface Props {
  video: typeof import('video-data:').default[string];
}

const Video: FunctionalComponent<Props> = ({ video }) => (
  <html lang="en">
    <head>
      <CommonHead />
      <title>{video.title} - HTTP 203</title>
    </head>
    <body>
      <div id="app">
        <HeaderLayout showBackIcon>
          <div class={styles.videoLayout}>
            <div class={styles.videoAndDetails}>
              <Embed video={video} key={video.id} />

              <div class={styles.videoDetails}>
                <h1 class={styles.videoTitle}>{video.title}</h1>
                <time>{formatDate(new Date(video.published))}</time>
                <div
                  class={styles.description}
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: video.description }}
                />
              </div>
            </div>
            <div class={styles.scroller}>
              <VideoList videos={pageData} />
            </div>
          </div>
        </HeaderLayout>
      </div>
    </body>
  </html>
);

export default Video;
