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

import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import visualizer from 'rollup-plugin-visualizer';
import alias from '@rollup/plugin-alias';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const buildInfo = require('./buildinfo');

export default {
  context: '(undefined)',
  plugins: [
    alias({
      entries: [
        { find: 'react-native', replacement: 'react-native-web' },
      ],
    }),
    nodeResolve({
      preferBuiltins: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(buildInfo.STABLE_NODE_ENV),
    }),
    commonjs(),
    json(),
    nodePolyfills(),
    visualizer({
      filename: 'bazel-out/k8-fastbuild/bin/src/frontend/web/bundle/stats.html',
    }),
    visualizer({
      template: 'network',
      filename: 'bazel-out/k8-fastbuild/bin/src/frontend/web/bundle/stats-network.html',
    }),
    visualizer({
      template: 'sunburst',
      filename: 'bazel-out/k8-fastbuild/bin/src/frontend/web/bundle/stats-sunburst.html',
    }),
  ],
  output: {
    exports: 'auto',
    sourcemap: 'inline',
  },
};
