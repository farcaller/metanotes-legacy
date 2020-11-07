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
 * id: 01EPJ15DFW0XTP9PSBWZGMCMP8
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/actions/edit/save
 * tags: ['$:core/ui/actions/edit']
 */

const { useCallback } = React;
const { useSelector, selectScribbleById, createCachedSelector, useDispatch, commitDraft } = core;
const { icons, IconButton, useHistory } = components;


const selectScribbleDraftOfById = createCachedSelector(
  selectScribbleById,
  (scribble) => scribble.attributes['draft-of'],
)((_, id) => id);

function SaveAction({ id }) {
  const originalId = useSelector(state => selectScribbleDraftOfById(state, id));

  const history = useHistory();
  const dispatch = useDispatch();

  const onClose = useCallback(() => {
    if (!originalId) {
      return;
    }
    // TODO: use core events?
    dispatch(commitDraft(id));
    history.push(`/${originalId}`);
  }, [id, originalId, history]);

  return (
    <IconButton onClick={onClose}>
      <icons.SaveIcon />
    </IconButton>
  )
}

export default React.memo(SaveAction);
