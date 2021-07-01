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

/* eslint-disable jsdoc/require-jsdoc */

// eslint-disable-next-line import/no-extraneous-dependencies
import { Node } from 'unist';
import * as commonmarkSpec from 'commonmark-spec';
import * as mdast from 'ts-mdast';
import beautify from 'beautify';
import remarkHTML from 'remark-html';
import unified from 'unified';

import makeParser from './parser';
import MockStore from '../../store/scribbles_store/mock_store';

const rootParsers = {} as { [k: string]: unified.Processor<unified.Settings> };
const mockStore = MockStore();

function doParse(doc: string, rootNode = 'Document'): mdast.Node {
  if (rootParsers[rootNode] === undefined) {
    const parser = unified()
      .use(makeParser, { parserScribbles: mockStore.scribblesByTag('$:core/parser'), rootNode });
    rootParsers[rootNode] = parser;
  }
  const parser = rootParsers[rootNode];

  let node = parser.parse(doc);
  node = parser.runSync(node);

  return node;
}

type TestSpec = {
  markdown: string;
  html: string;
  section: string;
  number: number;
};

function loadCommonmarkTests(): TestSpec[] {
  const tests: TestSpec[] = [];
  for (let i = 0; i < (commonmarkSpec as { tests: TestSpec[] }).tests.length; ++i) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tests.push((commonmarkSpec as { tests: TestSpec[] }).tests.find((s) => s.number === i)!);
  }
  return tests;
}

const commonmarkTests = loadCommonmarkTests();

function expectParse(doc: string, expected: Node[]): void {
  const node = doParse(doc);

  expect(node).toEqual({
    type: 'root',
    children: expected,
  });
}

function cleanupHtml(html: string): string {
  return beautify(html, { format: 'html' })
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x3C;/g, '<')
    .replace(/ \/>/g, '>')
    // TODO: this one might be an artefact of remarkHTML.
    .replace('\n\n</code>', '\n</code>');
}

function testCommonmark(idx: number, todoReason?: string, only = false) {
  const spec = commonmarkTests[idx];

  if (todoReason) {
    test.todo(`it passes the commonmark spec #${idx}: ${JSON.stringify(spec.markdown)}`);
    return;
  }
  const tf = only ? test.only : test;
  tf(`it passes the commonmark spec #${idx}: ${JSON.stringify(spec.markdown)}`, () => {
    const input = `${spec.markdown}`
      .replace(/→/g, '\t');
    const expected = cleanupHtml(spec.html);

    const parser = unified()
      .use(makeParser, { parserScribbles: mockStore.scribblesByTag('$:core/parser') })
      .use(remarkHTML);

    const astParser = unified()
      .use(makeParser, { parserScribbles: mockStore.scribblesByTag('$:core/parser') });

    let outString: string;

    function logParsed() {
      const node = astParser.parse(input);
      const processedNode = parser.runSync(node);
      console.warn(`spec #${idx}:\n`
        + `input:    ${JSON.stringify(input)}\n`
        + `expected: ${JSON.stringify(expected)}\n`
        + `received: ${JSON.stringify(outString)}\n`
        + `node:     ${JSON.stringify(processedNode, null, 2)
          .split('\n').map((l) => `          ${l}`)
          .join('\n')
          .trim()}\n`);
    }

    try {
      const output = parser.processSync(input);
      console.warn('out:', JSON.stringify(output));
      // TODO: despite this being renamed to `value` in VFile 5, someone (unified?) didn't get the note
      outString = cleanupHtml((output as unknown as { contents: string }).contents);
      if (outString !== expected) {
        logParsed();
      }
    } catch (e) {
      logParsed();
      throw e;
    }
    expect(outString).toEqual(expected);
  });
}

function testCommonmarkSection(section: string, skips: Record<number, string> = {}, endAt?: number, only?: number) {
  let count = 0;
  const finalIndex = endAt || commonmarkTests.length - 1;

  describe(section, () => {
    for (let i = 1; i <= finalIndex; ++i) {
      const spec = commonmarkTests[i];
      if (spec.section !== section) {
        // eslint-disable-next-line no-continue
        continue;
      }

      testCommonmark(i, skips[i], i === only);
      ++count;
    }
    if (count === 0) {
      throw Error(`no tests for section '${section}'`);
    }
  });
}

// 4.1 https://spec.commonmark.org/0.29/#thematic-breaks
testCommonmarkSection('Thematic breaks', {
  18: `TODO: indented code not implemented`,
  27: `TODO: list not implemented`,
  29: `TODO: header not implemented`,
  30: `TODO: list not implemented`,
  31: `TODO: list not implemented`,
});

// 4.2 https://spec.commonmark.org/0.29/#atx-heading
testCommonmarkSection('ATX headings', {
  39: `TODO: indented code not implemented`,
  47: `TODO: thematic break not implemented`,
});

// 4.3 https://spec.commonmark.org/0.29/#setext-headings
testCommonmarkSection('Setext headings', {
  55: `TODO: indented code not implemented`,
  61: `TODO: somehow broken by tags`,
  62: `TODO: blockquote not implemented`,
  63: `TODO: blockquote not implemented`,
  70: `TODO: indented code not implemented`,
  71: `TODO: blockquote not implemented`,
});

// 4.5 https://spec.commonmark.org/0.29/#fenced-code-blocks
testCommonmarkSection('Fenced code blocks', {
  91: `TODO: inline code not implemented`,
  98: `TODO: blockquote not implemented`,
  104: `TODO: indented code not implemented`,
  108: `TODO: inline code not implemented`,
  111: `TODO: header not implemented`,
  115: `TODO: inline code not implemented`,
});

// 4.8 https://spec.commonmark.org/0.29/#paragraphs
testCommonmarkSection('Paragraphs', {
  // 193: TODO: not sure this WAI for react-native
  195: `TODO: indented code not implemented`,
});

// 5.2 https://spec.commonmark.org/0.29/#list-items
testCommonmarkSection('List items', {
  223: `TODO: indented code & blockquote not implemented`,
  224: `TODO: indented code & blockquote not implemented`,
  227: `TODO: indented code not implemented`,
}, 228);

// 6.4 https://spec.commonmark.org/0.29/#emphasis-and-strong-emphasis
testCommonmarkSection('Emphasis and strong emphasis', {
  403: `TODO: links not implemented`,
  418: `TODO: links not implemented`,
  421: `TODO: links not implemented`,
  432: `TODO: links not implemented`,
  472: `TODO: links not implemented`,
  473: `TODO: links not implemented`,
  475: `TODO: links not implemented`,
  476: `TODO: links not implemented`,
  477: `TODO: inline code not implemented`,
  478: `TODO: inline code not implemented`,
  474: `TODO: inline html isn't supported so WAI?`,
  479: `TODO: links not implemented`,
  480: `TODO: links not implemented`,
});

// 6.9 https://spec.commonmark.org/0.29/#hard-line-breaks
testCommonmarkSection('Hard line breaks', {
  637: `TODO: inline code not implemented`,
  638: `TODO: inline code not implemented`,
  639: `TODO: links not implemented`,
  640: `TODO: links not implemented`,
  643: `TODO: headers not implemented`,
  644: `TODO: headers not implemented`,
});

test('break parser only triggers at line ends', () => {
  const n = doParse('hello  *\n');
  expect(n).toEqual({
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            value: 'hello  *',
          },
        ],
      },
    ],
  });
});

describe('widget tags', () => {
  describe('block level', () => {
    describe('no arguments', () => {
      it('parses a self-closing tag', () => {
        const n = doParse('<Tag/>\n');
        expect(n).toEqual({
          type: 'root',
          children: [
            {
              type: 'widget',
              name: 'tag',
              props: {},
            },
          ],
        });
      });

      it('parses a self-closing tag (closing tag with spaces)', () => {
        const n = doParse('<Tag />\n');
        expect(n).toEqual({
          type: 'root',
          children: [
            {
              type: 'widget',
              name: 'tag',
              props: {},
            },
          ],
        });
      });

      it('parses a self-closing tag (closing tag with newlines)', () => {
        const n = doParse('<Tag\n\n/>\n');
        expect(n).toEqual({
          type: 'root',
          children: [
            {
              type: 'widget',
              name: 'tag',
              props: {},
            },
          ],
        });
      });

      it('parses an empty tag', () => {
        const n = doParse('<Tag>\n</Tag>\n');
        expect(n).toEqual({
          type: 'root',
          children: [
            {
              type: 'widget',
              name: 'tag',
              children: [],
              props: {},
            },
          ],
        });
      });
    });
    describe('arguments', () => {
      it('parses a tag with props', () => {
        const n = doParse('<Tag key="a" other="b"/>\n');
        expect(n).toEqual({
          type: 'root',
          children: [
            {
              type: 'widget',
              name: 'tag',
              props: {
                key: 'a',
                other: 'b',
              },
            },
          ],
        });
      });
    });
    describe('children', () => {
      it('parses a tag with nested markdown', () => {
        const n = doParse('<Tag>\nhello\n</Tag>');
        expect(n).toEqual({
          type: 'root',
          children: [
            {
              type: 'widget',
              name: 'tag',
              props: {},
              children: [{
                type: 'paragraph',
                children: [{
                  type: 'text',
                  value: 'hello',
                }],
              }],
            },
          ],
        });
      });
      it('parses nested tags with nested markdown', () => {
        const n = doParse('<Hey k="1"><Tag>\nhello\n</Tag>\n</Hey>');
        expect(n).toEqual({
          type: 'root',
          children: [
            {
              type: 'widget',
              name: 'hey',
              props: { k: '1' },
              children: [{
                type: 'widget',
                name: 'tag',
                props: {},
                children: [{
                  type: 'paragraph',
                  children: [{
                    type: 'text',
                    value: 'hello',
                  }],
                }],
              }],
            },
          ],
        });
      });
    });
  });

  describe('inline level', () => {
    it('parses an inline echo tag', () => {
      const n = doParse('<$hello>\n');
      expect(n).toEqual({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{
              type: 'widget',
              name: 'echo',
              props: { name: 'hello' },
            }],
          },
        ],
      });
    });
  });
});
