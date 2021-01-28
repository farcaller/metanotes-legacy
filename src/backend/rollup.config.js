import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  external: ['fs'], // tells Rollup 'I know what I'm doing here'
  plugins: [
    nodeResolve({ preferBuiltins: false }), // or `true`
    commonjs(),
    json(),
  ]
};
