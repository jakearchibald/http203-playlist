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
import { h, FunctionalComponent, Fragment } from 'preact';

import 'add-css:../styles.module.css';
import initialCss from 'prerender-css:';
//import clientUrl, { imports } from 'client-bundle:client';
import faviconURL from 'url:static-build/assets/favicon.png';
import { escapeStyleScriptContent } from 'static-build/utils';

interface Props {}

const CommonHead: FunctionalComponent<Props> = () => (
  <>
    <meta charSet="utf-8" />
    <meta name="theme-color" content="#512DA8" />
    <meta name="viewport" content="width=device-width, minimum-scale=1.0" />
    <meta name="view-transition" content="same-origin" />
    <link rel="icon" type="image/png" href={faviconURL} />
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: escapeStyleScriptContent(initialCss),
      }}
    />
    {/*imports.map((preload) => (
      <link rel="preload" href={preload} as="script" />
    ))*/}
    {/*<script src={clientUrl} type="module" />*/}
  </>
);

export default CommonHead;
