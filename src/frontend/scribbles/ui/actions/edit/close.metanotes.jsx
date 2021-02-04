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
 * id: 01EPHGHQCVRT0B6FZXHRBJVQ8E
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/actions/edit/close
 * tags: ['$:core/ui/actions/edit']
 * list-after:
 */

const { useCallback } = React;
const { useSelector, selectScribbleById, createCachedSelector, useDispatch, removeScribble } = core;
const { Icon, IconButton, useHistory } = components;


const selectScribbleDraftOfById = createCachedSelector(
  selectScribbleById,
  (scribble) => scribble.attributes['mn-draft-of'],
)((_, id) => id);

function CloseAction({ id }) {
  const originalId = useSelector(state => selectScribbleDraftOfById(state, id));

  const history = useHistory();
  const dispatch = useDispatch();

  const onClose = useCallback(() => {
    // TODO: use core events?
    dispatch(removeScribble(id));
    if (originalId) {
      history.push(`/${originalId}`);
    }
  }, [id, originalId, history]);

  return (
    <IconButton onClick={onClose}>
      <Icon>close</Icon>
    </IconButton>
  )
}

export default React.memo(CloseAction);
