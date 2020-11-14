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
const { useDispatch, useSelector, selectScribbleById, updateScribbleAttributes, equals, useScribble, createCachedSelector } = core;
const { CardHeader, TextField } = components;


const filtered = (attrs, keys) => keys.reduce((obj, key) => ({ ...obj, [key]: attrs[key] }), {});

const RequiredAttributes = ['mn-draft-of', 'title'];

const selectScribblePartialAttributesById = createCachedSelector(
  selectScribbleById,
  (scribble) => filtered(scribble.attributes, RequiredAttributes),
)((_, id) => id);

function ScribbleCardHeader({ id }) {
  const Actions = useScribble(`$:core/ui/scribble-card-actions`);

  const attributes = useSelector(state => selectScribblePartialAttributesById(state, id), equals);
  const isEditing = attributes['mn-draft-of'] !== undefined;

  const dispatch = useDispatch();

  const onTitleChange = useCallback((event) => {
    dispatch(updateScribbleAttributes({
      id,
      attributes: {
        title: event.target.value,
      },
    }));
  }, [id]);

  // TODO: tabbing out from here should go into the text field
  let titleEl = isEditing ? <TextField fullWidth value={attributes.title ? attributes.title : ''} onChange={onTitleChange} /> : attributes.title;

  return (
    <CardHeader title={titleEl} action={<Actions id={id} />} />
  )
}

export default React.memo(ScribbleCardHeader);
