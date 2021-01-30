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
 * id: 01EP4MD8SB2AHXX07FAW73R4MH
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/editor/text/markdown
 */

const { useCallback } = React;
const { useDispatch, updateScribbleBody, useSelector, selectScribbleById } = core;
const { MonacoEditor, Paper, useDebouncedCallback } = components;


const MonacoConfig = {
  minimap: {
    enabled: false
  },
  wordWrap: 'on',
  lineNumbers: 'off',
  renderLineHighlight: 'none',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
};

function MarkdownEditor({ id }) {
  const body = useSelector(state => selectScribbleById(state, id).body);
  const dispatch = useDispatch();

  const debounced = useDebouncedCallback(
    (body) => {
      dispatch(updateScribbleBody({ id, body }));
    },
    100,
  );

  const debouncedCallback = useCallback((e, value) => debounced.callback(value), [debounced]);

  return (
    <Paper>
      <MonacoEditor
        height="400px"
        width={'100%'}
        language="markdown"
        value={body}
        onChange={debouncedCallback}
        options={MonacoConfig}
      />
    </Paper>
  );
}

export default React.memo(MarkdownEditor);