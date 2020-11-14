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
 * id: 01EPHG0PHHM7B3CJ7698A91K5Z
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/actions/view/edit
 * tags: ['$:core/ui/actions/view']
 */

const { useCallback } = React;
const { useSelector, selectScribbleById, createCachedSelector } = core;
const { icons, IconButton, useHistory, useCoreEvents } = components;


const selectScribbleStatusById = createCachedSelector(
  selectScribbleById,
  (scribble) => scribble.status,
)((_, id) => id);

function EditAction({ id }) {
  const scribbleStatus = useSelector(state => selectScribbleStatusById(state, id));
  
  const history = useHistory();
  const coreEvents = useCoreEvents();

  const onEdit = useCallback(() => {
    if (scribbleStatus !== 'core' && scribbleStatus !== 'synced') {
      console.log('cannot edit non-synced scribble');
      return;
    }
    const draftId = coreEvents.createDraft(id);
    history.push(`/${draftId}`);
  }, [id, scribbleStatus, history]);

  return (
    <IconButton onClick={onEdit}>
      <icons.Edit />
    </IconButton>
  )
}

export default React.memo(EditAction);
