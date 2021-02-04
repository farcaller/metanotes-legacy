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

/* eslint-disable react/require-default-props */

import React from 'react';

import { Components } from '../../../../metamarkdown/ast/components';
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
  code: ({ value }: { value: string }) => <pre>{value}</pre>,

  text: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  emphasis: ({ children }: { children?: React.ReactNode }) => <em>{children}</em>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong>{children}</strong>,
  delete: ({ children }: { children?: React.ReactNode }) => <del>{children}</del>,
  inlineCode: ({ value }: { value: string }) => <code>{value}</code>,
  break: () => <br />,
  image: Image,

  link: Link,

  // TODO: better typing
  metanotesTag: (tagname: string): React.FunctionComponent<unknown> => {
    switch (tagname) {
      case 'include':
        return Include as unknown as React.FunctionComponent<unknown>;
      default:
        return () => (
          <>
            unknown tag
            {tagname}
          </>
        );
    }
  },
  wikiLink: WikiLink,
};

export default components;
