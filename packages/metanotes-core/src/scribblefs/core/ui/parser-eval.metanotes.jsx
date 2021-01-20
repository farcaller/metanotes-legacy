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
 * id: 01EWE183S462BBPN9C2S9ZRF1A
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/ui/parser-eval
 */


const { useCallback, useState, useMemo, useEffect } = React;
const { equals, useSelector, selectScribblesByTag } = core;
const { TextField, MonacoEditor, Paper, useDebouncedCallback, ErrorBoundary, parseMarkdown, markdownComponents, makeParser, SyntaxHighlighter, useLocation, Button, buildLanguage, Parsimmon } = components;


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

  const debouncedCallback = useCallback((e, value) => debounced.callback(value), [debounced]);

  return (
    <Paper>
      <MonacoEditor
        height="400px"
        width={'100%'}
        language="javascript"
        value={input}
        onChange={debouncedCallback}
        options={MonacoConfig}
      />
    </Paper>
  );
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ParserEval() {
  const parserScribbles = useSelector(state => selectScribblesByTag(state, '$:core/parser'), equals);
  const parserScribblesKeyed = useMemo(() => {
    const scribsByName = {};
    for (const sc of parserScribbles) {
      scribsByName[sc.attributes['parser']] = sc;
    }
    return scribsByName;
  }, [parserScribbles]);

  const l = buildLanguage(parserScribblesKeyed);

  const query = useQuery();
  const [input, setInput] = useState(query.get('q') || '');
  const [output, setOutput] = useState('');

  useEffect(() => {
    query.set('q', input);
    const q = window.location.pathname + '?' + query.toString();
    window.history.pushState(null, '', q);
  }, [input]);

  const doEval = useCallback(() => {
    const wrap = `
      return function() {
        ${input};
      }();
`;
    const f = new Function('Parsimmon', 'l', wrap);
    const o = f(Parsimmon, l);
    setOutput(JSON.stringify(o, null, 2));
  }, [input]);

  return <div style={{ width: '100%' }}>
    <div>
      <Editor input={input} setInput={setInput} />
    </div>
    <div>
      <Button onClick={doEval}>eval</Button>
    </div>
    <div>
      <ErrorBoundary>
        <SyntaxHighlighter
          lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
          wrapLines={true}
          language="javascript"
          showLineNumbers={false}
        >
          {output}
        </SyntaxHighlighter>
      </ErrorBoundary>
    </div>
  </div>;
}

export default React.memo(ParserEval);
