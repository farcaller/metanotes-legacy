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

import { LinkProps } from '@metanotes/remark-metareact';


function Link({ url, title, children }: React.PropsWithChildren<LinkProps>): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return <a href={url} title={title} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export default React.memo(Link);
