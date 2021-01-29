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
 * id: 01EPHF0JG02V1P98G1ZNWF0FZ1
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/scribble-card-actions
 */

const { useMemo, useContext } = React;
const {
  useDispatch, useSelector, selectScribbleById, createCachedSelector, selectScribblesByTag,
  equals, loadScribbleComponent, UseScribbleContext, ScribbleResolverContext } = core;


const selectScribbleIsDraftById = createCachedSelector(
  selectScribbleById,
  (scribble) => scribble.attributes['mn-draft-of'] !== undefined,
)((_, id) => id);

function ScribbleCardActions({ id }) {
  const isEditing = useSelector(state => selectScribbleIsDraftById(state, id));

  const editActionScribbles = useSelector(state => selectScribblesByTag(state, '$:core/ui/actions/edit'), equals);
  const viewActionScribbles = useSelector(state => selectScribblesByTag(state, '$:core/ui/actions/view'), equals);

  const actionScribbles = isEditing ? editActionScribbles : viewActionScribbles;

  const cache = useContext(UseScribbleContext);
  const resolver = useContext(ScribbleResolverContext);
  const dispatch = useDispatch();
  const actions = useMemo(() => actionScribbles.map(scribble => {
    const Comp = loadScribbleComponent(resolver, dispatch, cache, scribble.attributes.title, scribble);
    return <Comp key={scribble.id} id={id} />;
  }), [id, isEditing, editActionScribbles, viewActionScribbles]);

  return (
    <>{actions}</>
  )
}

export default React.memo(ScribbleCardActions);
