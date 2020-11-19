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

import React from 'react';

import * as ast from 'ts-mdast';
import { VFile } from 'vfile';
import unified from 'unified';

import { Components } from './components';
import { InlineTagAst, isInlineTag } from './inlineTag';
import { isWikiLink, WikiLinkAst } from './wikiLink';


export interface Options {
  components: Components;
  inline?: boolean;
}

export interface ChildrenOptions {
  /**
   * Used to pass the list looseness state from the List to ListItems.
   */
  loose?: boolean;
}

function emitChildren(nodes: ast.Content[], options: Options, parent?: ast.Node, childrenOptions?: ChildrenOptions): JSX.Element[] {
  if (!nodes) {
    return [];
  }
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return nodes.map(n => emitNode(n, options, parent, childrenOptions) as JSX.Element);
}

function emitRoot(node: ast.Root, options: Options): JSX.Element|undefined {
  if (options.inline) {
    if (node.children.length !== 1) {
      return undefined;
    }
    const child = node.children[0];
    if (!ast.isParagraph(child)) {
      return undefined;
    }
    return React.createElement(React.Fragment, null, ...emitChildren(child.children, options));
  }
  return React.createElement(React.Fragment, null, ...emitChildren(node.children, options));
}

function emitSimpleComponent(node: ast.Parent, component: React.FunctionComponent<React.PropsWithChildren<unknown>>, options: Options): JSX.Element {
  return React.createElement(component, null, ...emitChildren(node.children, options));
}

function emitSimpleComponentNoChildren(_node: ast.Node, component: React.FunctionComponent<React.PropsWithChildren<unknown>>): JSX.Element {
  return React.createElement(component, null);
}

function emitHeading(node: ast.Heading, options: Options): JSX.Element {
  const { components } = options;
  return React.createElement(components.heading, { depth: node.depth }, ...emitChildren(node.children, options));
}

function emitList(node: ast.List, options: Options): JSX.Element {
  const { components } = options;

  // a list is loose if it's not spread and no child is spread
  const spread = node.spread || node.children.find(c => c.spread === true) !== undefined;

  return React.createElement(components.list, {
    ordered: node.ordered,
    start: node.start,
    spread: node.spread,
  }, ...emitChildren(node.children, options, node, { loose: !spread }));
}

function emitListItem(node: ast.ListItem, options: Options, _parent: ast.List, childrenOptions?: ChildrenOptions): JSX.Element {
  const { components } = options;

  const { loose } = childrenOptions ? childrenOptions : { loose: false };

  let shakenChildren: ast.Content[] = [];
  let child: ast.Node;
  const totalChildren = node.children.length;

  // TODO: figure out wtf and document this
  for(let i = 0; i < totalChildren; i++) {
    child = node.children[i];
    if (loose || i !== 0 || !ast.isParagraph(child)) {
      shakenChildren.push(ast.createText('\n'));
    }

    // TODO: mdast-util-to-hast has this condition negated (https://github.com/syntax-tree/mdast-util-to-hast/blob/main/lib/handlers/list-item.js#L52)
    //       but it makes no sense. WAT?
    if (ast.isParagraph(child) && loose) {
      shakenChildren = shakenChildren.concat(child.children);
    } else {
      shakenChildren.push(child as ast.Content);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (totalChildren && (loose || !ast.isParagraph(child!))) {
    shakenChildren.push(ast.createText('\n'));
  }

  return React.createElement(components.listItem, {
    checked: node.checked,
    spread: node.spread,
  }, ...emitChildren(shakenChildren, options));
}

function emitTable(node: ast.Table, options: Options): JSX.Element {
  const { components } = options;
  return React.createElement(components.table, {
    align: node.align,
  }, ...emitChildren(node.children, options));
}

function emitCode(node: ast.Code, options: Options): JSX.Element {
  const { components } = options;
  return React.createElement(components.code, {
    lang: node.lang,
    meta: node.meta,
    value: node.value,
  });
}

function emitInlineCode(node: ast.InlineCode, options: Options): JSX.Element {
  const { components } = options;
  return React.createElement(components.inlineCode, {
    value: node.value,
  });
}

function emitText(node: ast.Text, { components }: Options): JSX.Element {
  return React.createElement(components.text, null, node.value);
}

function emitImage(node: ast.Image, { components }: Options): JSX.Element {
  return React.createElement(components.image, {
    url: node.url,
    title: node.title,
    alt: node.alt,
  });
}

function emitLink(node: ast.Link, options: Options): JSX.Element {
  const { components } = options;
  return React.createElement(components.link, {
    url: node.url,
    title: node.title,
  }, ...emitChildren(node.children, options));
}

function emitMetaNotesTag(node: InlineTagAst, options: Options): JSX.Element {
  const { components } = options;
  return React.createElement(components.metanotesTag(node.tagName), node.params, ...emitChildren(node.children, options));
}

function emitWikiLink(node: WikiLinkAst, options: Options): JSX.Element {
  const { components } = options;
  return React.createElement(components.wikiLink, { target: node.value });
}

function emitNode(node: ast.Node, options: Options, parent?: ast.Node, childrenOptions?: ChildrenOptions): JSX.Element | undefined {
  if (ast.isRoot(node)) {
    return emitRoot(node, options);
  }

  const { components } = options;

  // TopLevelContent = BlockContent | FrontmatterContent | DefinitionContent

  // BlockContent = Paragraph | Heading | ThematicBreak | Blockquote | List | Table | HTML | Code
  if (ast.isParagraph(node)) {
    // TODO: transform several text elements in a paragraph so that they are nested (this repalaces divs with spans)
    return emitSimpleComponent(node, components.paragraph, options);
  }
  if (ast.isHeading(node)) {
    return emitHeading(node, options);
  }
  if (ast.isThematicBreak(node)) {
    // nb: ast.ThematicBreak doesn't have children, but emitChildren can handle the undefined input.
    return emitSimpleComponent(node as ast.Parent, components.thematicBreak, options);
  }
  if (ast.isBlockquote(node)) {
    return emitSimpleComponent(node, components.blockquote, options);
  }
  if (ast.isList(node)) {
    return emitList(node, options);
  }
  if (ast.isTable(node)) {
    return emitTable(node, options);
  }

  if (ast.isListItem(node)) {
    return emitListItem(node, options, parent as ast.List, childrenOptions);
  }
  if (ast.isTableRow(node)) {
    return emitSimpleComponent(node, components.tableRow, options);
  }
  if (ast.isTableCell(node)) {
    return emitSimpleComponent(node, components.tableCell, options);
  }
  // nb: html parser is disabled in index.ts
  if (ast.isCode(node)) {
    return emitCode(node, options);
  }

  // PhrasingContent = StaticPhrasingContent | Link | LinkReference

  // StaticPhrasingContent = Text | Emphasis | Strong | Delete | HTML | InlineCode | Break | Image | ImageReference | Footnote | FootnoteReference
  if (ast.isText(node)) {
    return emitText(node, options);
  }
  if (ast.isEmphasis(node)) {
    return emitSimpleComponent(node, components.emphasis, options);
  }
  if (ast.isStrong(node)) {
    return emitSimpleComponent(node, components.strong, options);
  }
  if (ast.isDelete(node)) {
    return emitSimpleComponent(node, components.delete, options);
  }
  if (ast.isInlineCode(node)) {
    return emitInlineCode(node, options);
  }
  if (ast.isBreak(node)) {
    return emitSimpleComponentNoChildren(node, components.break);
  }
  if (ast.isImage(node)) {
    return emitImage(node, options);
  }

  if (ast.isLink(node)) {
    return emitLink(node, options);
  }

  if (isInlineTag(node)) {
    return emitMetaNotesTag(node, options);
  }
  if (isWikiLink(node)) {
    return emitWikiLink(node, options);
  }

  console.error(`unhandled node type ${node.type}`, node);
  return React.createElement(React.Fragment);
}

export function metaCompiler(this: unified.Processor, options: Options): void {
  this.Compiler = (root: ast.Node, _file: VFile) => {
    return emitNode(root, options) as unknown as string;
  };
}
