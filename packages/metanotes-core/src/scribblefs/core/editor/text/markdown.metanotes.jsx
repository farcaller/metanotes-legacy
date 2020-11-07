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
const { useDispatch, updateScribble, useSelector, selectScribbleById } = core;
const { MonacoEditor, Paper } = components;


const monacoConfig = {
  minimap: {
    enabled: false
  },
  wordWrap: 'on',
};

function MarkdownEditor({ id }) {
  const body = useSelector(state => selectScribbleById(state, id).body);
  const dispatch = useDispatch();

  const onChange = useCallback((ev, value) => {
    dispatch(updateScribble({ id, changes: { body: value }}));
  }, [id]);

  return (
    <Paper>
      <MonacoEditor
        height="400px"
        width={'100%'}
        language="markdown"
        value={body}
        onChange={onChange}
        options={monacoConfig}
      />
    </Paper>
  );
}

export default React.memo(MarkdownEditor);
