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

import { observer as observer_ } from 'mobx-react-lite';

import useStore_ from '../../frontend/store/context/use_context';
import { Scribble as Scribble_ } from '../../frontend/store/interface/scribble';

export const useStore = useStore_;
export type Scribble = Scribble_;
export const observer = observer_;
