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
 * id: 01EP5BPX6W0YT6ATM6GM6NEWZ0
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/view-scribble-card
 */

const { useState } = React;
const { useScribble, useDispatch, equals, removeScribble } = core;
const { Card, CardContent, CardHeader, useHistory, useCoreEvents, ErrorBoundary } = components;

function ViewScribbleCard({ scribble, children }) {
  const dispatch = useDispatch();
  const Renderer = useScribble(`$:core/renderer/${scribble.attributes['content-type']}`);

  const [actionsOpen, setActionsOpen] = useState(false);

  const onActionsOpen = () => setActionsOpen(true);
  const onActionsClose = () => setActionsOpen(false);

  const history = useHistory();
  const coreEvents = useCoreEvents();

  const onEdit = () => {
    if (scribble.status !== 'core' && scribble.status !== 'synced') {
      console.log('cannot edit non-synced scribble');
      return;
    }
    const draftId = coreEvents.createDraft(scribble);
    history.push(`/${draftId}`);
  };

  const onClose = () => {
    const originalId = scribble.attributes['mn-draft-of'];
    if (!originalId) {
      return;
    }
    dispatch(removeScribble(scribble));
    history.push(`/${originalId}`);
  }

  return (
    <Card>
      <CardHeader
        title={scribble.attributes.title}
      />
      <CardContent>
        <ErrorBoundary>
          <Renderer scribble={scribble} />
        </ErrorBoundary>
      </CardContent>
    </Card>
  )
}

export default React.memo(ViewScribbleCard, (prev, next) => equals(prev.scribble, next.scribble));
