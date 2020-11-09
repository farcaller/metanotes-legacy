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
 * id: 01EPC2RK8RG401D6E9X0WT7A1E
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/scribble-card-header
 */

const { useCallback } = React;
const { dispatch, useSelector, selectScribbleById, updateScribble, equals, useScribble } = core;
const { CardHeader, TextField } = components;


function ScribbleCardHeader({ id }) {
  const Actions = useScribble(`$:core/ui/scribble-card-actions`);

  const scribble = useSelector(state => {
    const sc = selectScribbleById(state, id);
    return {
      attributes: {
        'mn-draft-of': sc.attributes['mn-draft-of'],
        title: sc.attributes.title,
      }
    };
  }, equals);

  const isEditing = scribble.attributes['mn-draft-of'] !== undefined;

  const onTitleChange = useCallback((event) => {
    dispatch(updateScribble({ id, changes: { attributes: { title: event.target.value } } }));
  }, [id]);

  let titleEl = isEditing ? <TextField fullWidth value={scribble.attributes.title} onChange={onTitleChange} /> : scribble.attributes.title;

  return (
    <CardHeader title={titleEl} action={<Actions id={id} />} />
  )
}

export default React.memo(ScribbleCardHeader);
