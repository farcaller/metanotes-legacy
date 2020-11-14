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
 * id: 01EPPMBSY0BZNTRZAKBJMK387Z
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/scribble-content-type-editor
 */

const { useMemo, useContext, useCallback } = React;
const { useDispatch, useSelector, selectScribbleById, createCachedSelector, updateScribbleAttributes } = core;
const { Autocomplete, TextField } = components;


const selectScribbleContentTypeById = createCachedSelector(
  selectScribbleById,
  (scribble) => scribble.attributes['content-type'],
)((_, id) => id);

const DefaltContentTypes = [
  'text/markdown',
  'application/vnd.metanotes.component-jsmodule',
];

function ScribbleContentTypeEditor({ id }) {
  const contentType = useSelector(state => selectScribbleContentTypeById(state, id));
  
  const dispatch = useDispatch();

  const onChangeContentType = useCallback((_, newValue) => {
    dispatch(updateScribbleAttributes({ id, attributes: { 'content-type': newValue } }));
  }, [id]);

  return (
    <Autocomplete
      value={contentType}
      onInputChange={onChangeContentType}
      options={DefaltContentTypes}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo
      renderInput={(params) => (
        <TextField {...params} label="Content Type" variant="outlined" />
      )}
    />
  );
}

export default React.memo(ScribbleContentTypeEditor);
