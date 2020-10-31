// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* attributes *
 * id: 01ENXNQD82ASJ0V5CJYAKRYHEW
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/scribble-container
 */

const { useScribble, useDispatch, fetchScribble, equals } = core;
const { LinearProgress, Alert } = components;

function ScribbleContainer({ scribble }) {
  const dispatch = useDispatch();
  const Renderer = useScribble(`$:core/renderer/${scribble.attributes['content-type']}`);

  let contentEl;
  switch (scribble.status) {
    case 'core':
    case 'synced':
      contentEl = <Renderer scribble={scribble} />;
      break;
    case 'syncedMetadataOnly':
      dispatch(fetchScribble(scribble));
      contentEl = <LinearProgress />;
      break;
    case 'pullingBody':
      contentEl = <LinearProgress/>;
      break;
    case 'failed':
      {
        const title = scribble.attributes.title ? '(' + scribble.attributes.title + ')' : '';
        contentEl = <Alert severity="error">failed to fetch scribble {scribble.id}{title}: <code>{scribble.error}</code></Alert>
      }
      break;
  }

  return contentEl;
}

export default React.memo(ScribbleContainer, (prev, next) => equals(prev.scribble, next.scribble));
