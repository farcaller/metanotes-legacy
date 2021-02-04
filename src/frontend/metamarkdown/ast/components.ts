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

export interface HeadingProps {
  depth: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ListProps {
  ordered?: boolean;
  start?: number;
  spread?: boolean;
}

export interface ListItemProps {
  checked?: boolean;
  spread?: boolean;
}

export interface TableProps {
  align?: ('left' | 'right' | 'center' | null)[];
}

export interface CodeProps {
  lang?: string;
  meta?: string;
  value: string;
}

export interface InlineCodeProps {
  value: string;
}

export interface ImageProps {
  url ?: string;
  title ?: string;
  alt ?: string;
}

export interface LinkProps {
  url?: string;
  title?: string;
}

export interface WikiLinkProps {
  target: string
}

type ComponentWithChildren = React.FunctionComponent<React.PropsWithChildren<unknown>>;
type ComponentWithChildrenAndProps<T> = React.FunctionComponent<React.PropsWithChildren<T>>;
type ComponentWithNoChildren = React.FunctionComponent<unknown>;
type ComponentWithNoChildrenAndProps<T> = React.FunctionComponent<T>;

export interface Components {
  paragraph: ComponentWithChildren;
  heading: ComponentWithChildrenAndProps<HeadingProps>;
  thematicBreak: ComponentWithNoChildren;
  blockquote: ComponentWithChildren;
  list: ComponentWithChildrenAndProps<ListProps>;
  listItem: ComponentWithChildrenAndProps<ListItemProps>;
  table: ComponentWithChildrenAndProps<TableProps>;
  tableRow: ComponentWithChildren;
  tableCell: ComponentWithChildren;
  code: ComponentWithNoChildrenAndProps<CodeProps>;

  text: ComponentWithChildren;
  emphasis: ComponentWithChildren;
  strong: ComponentWithChildren;
  delete: ComponentWithChildren;
  inlineCode: ComponentWithNoChildrenAndProps<InlineCodeProps>;
  break: ComponentWithNoChildren;
  image: ComponentWithNoChildrenAndProps<ImageProps>;

  link: ComponentWithNoChildrenAndProps<LinkProps>;

  metanotesTag: (tagname: string) => React.FunctionComponent<unknown>;
  wikiLink: ComponentWithNoChildrenAndProps<WikiLinkProps>;
}
