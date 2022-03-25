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
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import * as path from 'path';
import { readFile } from 'fs/promises';

const importPrefix = 'video-data:';

export default function videoDataPlugin() {
  return {
    name: 'video-data',
    async resolveId(id) {
      if (id !== importPrefix) return;
      return importPrefix;
    },
    async load(id) {
      if (id !== importPrefix) return;
      const dataFile = path.join(__dirname, 'lib', 'data.json');
      const data = JSON.parse(await readFile(dataFile, 'utf8'));
      this.addWatchFile(dataFile);

      const processedData = Object.fromEntries(
        data.map((dataItem) => {
          const title = dataItem.snippet.title
            .replace(/ [-|] HTTP ?203( Advent)?$/, '')
            .replace(/^HTTP 203: /, '')
            .replace(/ \(S\d, Ep\d\)$/, '');

          return [
            title
              .replace(/[^a-z0-9 ]/gi, '')
              .replace(/\s+/gi, '-')
              .toLowerCase(),
            {
              id: dataItem.snippet.resourceId.videoId,
              title,
              description: DOMPurify.sanitize(
                marked.parse(dataItem.snippet.description, {
                  gfm: true,
                  breaks: true,
                }),
              ),
              published: dataItem.snippet.publishedAt,
            },
          ];
        }),
      );

      return `export default ${JSON.stringify(processedData)};`;
    },
  };
}
