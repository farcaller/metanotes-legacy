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
 * id: 01EV1T0QZVGYYDP71S61F5536G
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/parser-test
 */


const { useCallback, useState, useMemo, useEffect } = React;
const { equals, useSelector, selectScribblesByTag } = core;
const { TextField, MonacoEditor, Paper, useDebouncedCallback, ErrorBoundary, parseMarkdown, markdownComponents, makeParser, SyntaxHighlighter, useLocation } = components;


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

function Editor({ input, setInput }) {
  const debounced = useDebouncedCallback(
    (body) => {
      setInput(body);
    },
    100,
  );

  const debouncedCallback = useCallback((value) => debounced.callback(value), [debounced]);

  return (
    <Paper>
      <MonacoEditor
        height="400px"
        width="100%"
        language="markdown"
        value={input}
        onChange={debouncedCallback}
        options={MonacoConfig}
      />
    </Paper>
  );
}

function Render({ text, rootNode }) {
  const parserScribbles = useSelector(state => selectScribblesByTag(state, '$:core/parser'), equals);
  const parserScribblesKeyed = useMemo(() => {
    const scribsByName = {};
    for (const sc of parserScribbles) {
      scribsByName[sc.attributes['parser']] = sc;
    }
    return scribsByName;
  }, [parserScribbles]);

  const inline = true;

  const parsed = parseMarkdown(text, markdownComponents, inline === true, makeParser, { parserScribbles: parserScribblesKeyed, rootNode });
  const parsedJS = JSON.stringify(parsed, undefined, 2);

  return <SyntaxHighlighter
    lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
    wrapLines={true}
    language="javascript"
    showLineNumbers={false}
  >
    {parsedJS}
  </SyntaxHighlighter>
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ParserTest() {
  const query = useQuery();
  const [input, setInput] = useState(query.get('q') || '');
  const [parser, setParser] = useState(query.get('parser') || 'Document');

  const handleChange = useCallback((event) => {
    setParser(event.target.value);
  }, [setParser]);

  useEffect(() => {
    query.set('parser', parser);
    query.set('q', input);
    const q = window.location.pathname + '?' + query.toString();
    window.history.pushState(null, '', q);
  }, [input, parser]);

  return <div style={{ width: '100%' }}>
    <div>
      <TextField
        style={{ width: '100%' }}
        id="filled-name"
        label="Parser"
        value={parser}
        onChange={handleChange}
        variant="filled"
      />
    </div>
    <div>
      <Editor input={input} setInput={setInput} />
    </div>
    <div>
      <ErrorBoundary>
        <Render text={input} rootNode={parser} />
      </ErrorBoundary>
    </div>
  </div>;
}

export default React.memo(ParserTest);
