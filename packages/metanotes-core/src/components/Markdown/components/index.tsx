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

import React  from 'react';

import { Components } from '@metanotes/remark-metareact';
import Include from './Include';
import Image from './Image';
import WikiLink from './WikiLink';
import Paragraph from './Paragraph';
import Heading from './Heading';
import ThematicBreak from './ThematicBreak';
import Blockquote from './Blockquote';
import List from './List';
import ListItem from './ListItem';
import Link from './Link';


const components: Components = {
  paragraph: Paragraph,
  heading: Heading,
  thematicBreak: ThematicBreak,
  blockquote: Blockquote,
  list: List,
  listItem: ListItem,
  table: () => <></>,
  tableRow: () => <></>,
  tableCell: () => <></>,
  code: ({ value }) => <pre>{value}</pre>,

  text: ({ children }) => <>{children}</>,
  emphasis: ({ children }) => <em>{children}</em>,
  strong: ({ children }) => <strong>{children}</strong>,
  delete: ({ children }) => <del>{children}</del>,
  inlineCode: ({ value }) => <code>{value}</code>,
  break: () => <br/>,
  image: Image,

  link: Link,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mjTag: (tagname: string): React.FunctionComponent<any> => {
    if (tagname === 'include') {
      return Include;
    }
    return () => <>unknown tag {tagname}</>;
  },
  wikiLink: WikiLink,
};

const memoComps = {} as Components;
Object.keys(components).map(k => {
  if (k !== 'mjTag') {
    // TODO: just memoize it before this
    (memoComps as unknown as { [x: string]: React.FunctionComponent<unknown> })[k] = React.memo((components as unknown as { [x: string]: React.FunctionComponent<unknown> })[k]);
  } else {
    memoComps[k] = components[k];
  }
});

export default memoComps;
