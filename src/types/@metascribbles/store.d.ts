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

import EvalStoreContext_ from '../../frontend/store/scribble/eval/context';
import useStore_ from '../../frontend/store/scribbles_store/use_context';
import useEvalStore_ from '../../frontend/store/scribble/eval/use_context';
import useSpreadStore_ from '../../frontend/store/spread_store/use_context';

export { observer } from 'mobx-react-lite';

export { Scribble } from '../../frontend/store/scribble/scribble_interface';
export { EvalStore } from '../../frontend/store/scribble/eval/context';

export const useStore = useStore_;
export const useEvalStore = useEvalStore_;
export const useSpreadStore = useSpreadStore_;
export const EvalStoreContext = EvalStoreContext_;

