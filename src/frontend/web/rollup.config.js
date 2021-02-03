import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-node-polyfills';
const buildInfo = require('./buildinfo');

export default {
  context: '(undefined)',
  plugins: [
    nodeResolve({
      preferBuiltins: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(buildInfo.STABLE_NODE_ENV),
    }),
    commonjs(),
    json(),
    nodePolyfills(),
  ],
  output: {
    exports: 'auto',
    sourcemap: false,
  },
};
