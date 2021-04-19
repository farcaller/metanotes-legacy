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
//
// NB:
//
// This code heavily relies on the markdown-it parsing mechanic, originally
// licensed under:
//
// Copyright (c) 2014 Vitaly Puzrin, Alex Kocharin.
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

/* attributes *
 * id: 01F3K9S12F34B8WJ4NJTE38K4B
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/parser-helpers/balanceEmphasisChildren
 */

function isDelimiterRun(x) {
  return x.type === 'delimiter_run';
}

function rewriteVerbatimDelimeters(children) {
  for (let i = 0; i < children.length; ++i) {
    const delim = children[i];
    if (delim && isDelimiterRun(delim)) {
      children.splice(i, 1, {
        type: 'text',
        value: delim.marker,
      });
    }
  }
}

function balanceEmphasisChildren(block) {
  const delimiters = [];
  const { children } = block;

  for (let i = 0; i < children.length; ++i) {
    const child = children[i];
    if (isDelimiterRun(child)) {
      child.originalIdx = i;
      delimiters.push(child);
    }
  }

  const openersBottom = new Map();
  for (let closerIdx = 0; closerIdx < delimiters.length; ++closerIdx) {
    const closer = delimiters[closerIdx];
    if (!closer.canClose) continue;
    if (!openersBottom.has(closer.marker)) {
      openersBottom.set(closer.marker, [-1, -1, -1]);
    }
    const minOpenerIdx = openersBottom.get(closer.marker)[closer.length % 3];
    let openerIdx = closerIdx - closer.jump - 1;
    if (openerIdx < -1) openerIdx = -1;
    let newMinOpenerIdx = openerIdx;

    let opener = delimiters[openerIdx];
    for (; openerIdx > minOpenerIdx; openerIdx -= opener.jump + 1) {
      opener = delimiters[openerIdx];

      if (opener.marker !== closer.marker) { continue; }

      if (opener.canOpen && opener.end < 0) {
        let isOddMatch = false;
        if (opener.canClose || closer.canOpen) {
          if ((opener.length + closer.length) % 3 === 0) {
            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
              isOddMatch = true;
            }
          }
        }
        if (!isOddMatch) {
          const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].canOpen
            ? delimiters[openerIdx - 1].jump + 1
            : 0;

          closer.jump = closerIdx - openerIdx + lastJump;
          closer.canOpen = false;
          opener.end = closerIdx;
          opener.jump = lastJump;
          opener.canClose = false;
          newMinOpenerIdx = -1;

          break;
        }
      }
    }
    if (newMinOpenerIdx !== -1) {
      openersBottom.get(closer.marker)[(closer.length || 0) % 3] = newMinOpenerIdx;
    }
  }

  for (let i = delimiters.length - 1; i >= 0; --i) {
    let startDelim = delimiters[i];
    if (startDelim.end === -1) { continue; }
    let endDelim = delimiters[startDelim.end];

    let isStrong = false;
    if (startDelim.originalIdx > 0 && endDelim.originalIdx < children.length - 1) {
      const prev = children[startDelim.originalIdx - 1];
      const next = children[endDelim.originalIdx + 1];
      if (isDelimiterRun(prev) && isDelimiterRun(next)) {
        if (delimiters[prev.end].originalIdx === next.originalIdx) {
          if (prev.marker === startDelim.marker) {
            isStrong = true;
          }
        }
      }
    }

    if (isStrong) {
      startDelim = delimiters[i - 1];
      endDelim = delimiters[startDelim.end];
    }

    const runLength = endDelim.originalIdx - startDelim.originalIdx;
    const replacement = new Array(runLength);
    let tagChildren = children.splice(startDelim.originalIdx + 1, runLength, ...replacement);
    tagChildren.pop();
    tagChildren = tagChildren.filter(Boolean);
    rewriteVerbatimDelimeters(tagChildren);

    if (isStrong) {
      tagChildren.shift();
      tagChildren.pop();
    }

    const openTag = {
      type: isStrong ? 'strong' : 'emphasis',
      children: tagChildren,
    };

    children.splice(startDelim.originalIdx, 1, openTag);

    if (isStrong) {
      --i;
    }
  }

  rewriteVerbatimDelimeters(children);

  block.children = children.filter(Boolean);
  return block;
}

export default balanceEmphasisChildren;
