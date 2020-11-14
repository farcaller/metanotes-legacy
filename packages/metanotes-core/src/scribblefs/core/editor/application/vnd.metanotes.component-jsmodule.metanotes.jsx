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
 * id: 01EQ47KZRRSDX23TV1HYPHNS2C
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/editor/application/vnd.metanotes.component-jsmodule
 */

const { useCallback } = React;
const { useDispatch, updateScribbleBody, useSelector, selectScribbleById } = core;
const { MonacoEditor, Paper } = components;


const MonacoConfig = {
  minimap: {
    enabled: false
  },
  wordWrap: 'off',
  lineNumbers: 'on',
  renderLineHighlight: 'none',
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
};

function JavascriptEditor({ id }) {
  const body = useSelector(state => selectScribbleById(state, id).body);
  const dispatch = useDispatch();

  const onChange = useCallback((ev, body) => {
    dispatch(updateScribbleBody({ id, body }));
  }, [id]);

  return (
    <Paper>
      <MonacoEditor
        height="400px"
        width={'100%'}
        language="javascript"
        value={body}
        onChange={onChange}
        options={MonacoConfig}
      />
    </Paper>
  );
}

export default React.memo(JavascriptEditor);