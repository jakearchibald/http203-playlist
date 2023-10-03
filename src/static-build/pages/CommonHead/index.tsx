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
    <meta http-equiv="origin-trial" content="AteY8ah5aqorHJWyw8H0saZ0Va196D5FMvISj5sy+j9xkgIYUYdD2J+I2lf5X70onDi6iCywXOZV73b0OSuhkwcAAABheyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiU3BlY3VsYXRpb25SdWxlc1ByZWZldGNoRnV0dXJlIiwiZXhwaXJ5IjoxNzA5NjgzMTk5fQ==" />
    <meta http-equiv="origin-trial" content="AoljjrsWltHIWWS6/KBvqy9Wv6pxW9Q691YmEtcO1uCdRvpEBwAnkVvC75VxdIBcz2YXl80DZnatIF+mJFUmigMAAACHeyJvcmlnaW4iOiJodHRwczovL2RlcGxveS1wcmV2aWV3LTI5LS1odHRwMjAzLXBsYXlsaXN0Lm5ldGxpZnkuYXBwOjQ0MyIsImZlYXR1cmUiOiJTcGVjdWxhdGlvblJ1bGVzUHJlZmV0Y2hGdXR1cmUiLCJleHBpcnkiOjE3MDk2ODMxOTl9" />
    <script type="speculationrules" dangerouslySetInnerHTML={ { __html: `
      {
          "prerender": [
            {
              "source": "document",
              "where": {
                "href_matches": "/*\\\\?*#*", "relative_to": "document"
              },
              "eagerness": "moderate"
            }
          ]
        }`
      }} />
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: escapeStyleScriptContent(initialCss),
      }}
    />
  </>
);

export default CommonHead;
