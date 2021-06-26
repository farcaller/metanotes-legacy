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
 * id: 01F8ZAC62DGJE5R9DDH3EW8EDA
 * content-type: application/vnd.metanotes.component-jsmodule
 * title: $:core/widget/query
 */

import React, { useEffect } from '@metascribbles/react';
import { useEvalStore, useStore, observer } from '@metascribbles/store';
import { Pipeline, evalCmdlet } from '@metascribbles/filter';

function QueryWidget({ query, bind }: { query: string, bind: string}) {
  const store = useStore();
  const evalStore = useEvalStore();

  const pipeline = Pipeline.tryParse(query);
  let input;

  for (const cmdlet of pipeline) {
    const args = cmdlet.args.map((arg: string|number) => {
      const strArg = `${arg}`;
      if (strArg.startsWith('${') && strArg.endsWith('}')) {
        return evalStore.get(strArg.slice(2, strArg.length - 1)) as string ?? '';
      }
      return arg;
    });
    cmdlet.args = args;

    const result = evalCmdlet(store, cmdlet, input);
    input = result;
  }

  useEffect(() => {
    evalStore.set(bind, input);
  }, [evalStore, bind, input]);

  return <></>;
}

export default observer(QueryWidget);
