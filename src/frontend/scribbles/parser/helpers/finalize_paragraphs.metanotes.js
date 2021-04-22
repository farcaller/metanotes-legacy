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
 * id: 01F3STAC8N07YWJDWAX0K92W0N
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser-helpers/finalizeParagraphs
 */

function removeParagraphTrailingBreak(block) {
  const lastIdx = block.children.length - 1;
  if (block.children[lastIdx].type === 'break') {
    const breakEl = block.children.pop();
    // https://spec.commonmark.org/0.29/#example-641
    if (breakEl.isBackslash) {
      block.children[lastIdx - 1].value += '\\';
    }
  }
}

const balanceEmphasisChildren = requireScribble('$:core/parser-helpers/balanceEmphasisChildren');
const collapseText = requireScribble('$:core/parser-helpers/collapseText');

function finalizeParagraphs(blocks) {
  const newBlocks = [];
  let currParagraph = null;
  for (const block of blocks) {
    if (block.type === 'partial_paragraph') {
      if (currParagraph !== null) {
        currParagraph.children = currParagraph.children.concat(
          { type: 'text', value: '\n' },
          block.children,
        );
      } else {
        currParagraph = block;
        currParagraph.type = 'paragraph';
      }
    } else if (block.type === 'partial_setext_heading') {
      if (currParagraph !== null) {
        removeParagraphTrailingBreak(currParagraph);
        balanceEmphasisChildren(currParagraph);
        collapseText(currParagraph);
        newBlocks.push({
          type: 'heading',
          depth: block.depth,
          children: currParagraph.children,
        });
        currParagraph = null;
      } else if (block.originalValue
        .match(/[^\S\r\n]{0,3}((\*[^\S\r\n]*){3,}|(-[^\S\r\n]*){3,}|(_[^\S\r\n]*){3,})\n/)) {
        newBlocks.push({
          type: 'thematicBreak',
        });
      } else {
        currParagraph = {
          type: 'paragraph',
          children: [{ type: 'text', value: block.originalValue }],
        };
      }
    } else {
      if (currParagraph !== null) {
        removeParagraphTrailingBreak(currParagraph);
        balanceEmphasisChildren(currParagraph);
        collapseText(currParagraph);
        newBlocks.push(currParagraph);
        currParagraph = null;
      }
      if (block.type !== 'empty_line') {
        newBlocks.push(block);
      }
    }
  }
  if (currParagraph !== null) {
    removeParagraphTrailingBreak(currParagraph);
    balanceEmphasisChildren(currParagraph);
    collapseText(currParagraph);
    newBlocks.push(currParagraph);
  }
  return newBlocks;
}

export default finalizeParagraphs;
