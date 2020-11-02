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

const { useState, useScribble, useDispatch, fetchScribble, equals, useEffect, removeScribble } = core;
const { LinearProgress, Alert, Card, CardContent, SpeedDial, SpeedDialIcon, SpeedDialAction, CardHeader, icons, useHistory, useCoreEvents } = components;

function ScribbleContainer({ scribble }) {
  const dispatch = useDispatch();
  const Renderer = useScribble(`$:core/renderer/${scribble.attributes['content-type']}`);
  const Editor = useScribble(`$:core/editor/${scribble.attributes['content-type']}`);

  let contentEl;
  switch (scribble.status) {
    case 'core':
    case 'synced':
      contentEl = scribble.attributes['draft-of'] !== undefined ? <Editor scribble={scribble} /> : <Renderer scribble={scribble} />;
      break;
    case 'syncedMetadataOnly':
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

  // TODO: I don't quite understand the mechanics but having this outside useEffect causes a render loop
  useEffect(() => {
    if (scribble.status === 'syncedMetadataOnly') {
      dispatch(fetchScribble(scribble));
    }
  });

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
    const originalId = scribble.attributes['draft-of'];
    if (!originalId) {
      return;
    }
    dispatch(removeScribble(scribble));
    history.push(`/${originalId}`);
  }

  return (
    <Card>
      <CardHeader
        action={
          <SpeedDial
            ariaLabel="actions"
            icon={<icons.MoreVertIcon />}
            direction="left"
            open={actionsOpen}
            onOpen={onActionsOpen}
            onClose={onActionsClose}
            FabProps={{
              size: "small",
              style: { backgroundColor: 'white', color: 'black' },
            }}
          >
            <SpeedDialAction
              icon={<icons.CloseIcon />}
              tooltipPlacement="top"
              tooltipTitle="close"
              onClick={onClose}
            />
            <SpeedDialAction
              icon={<icons.EditIcon/>}
              tooltipPlacement="top"
              tooltipTitle="edit"
              onClick={onEdit}
            />
          </SpeedDial>
        }
        title={scribble.attributes.title}
      />
      <CardContent>
        {contentEl}
      </CardContent>
    </Card>
  )
}

export default React.memo(ScribbleContainer, (prev, next) => equals(prev.scribble, next.scribble));
