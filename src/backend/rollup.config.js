import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
// import globals from 'rollup-plugin-node-globals';
// import builtins from 'rollup-plugin-node-builtins';

export default {
  // entry: 'test.js',
  // dest: 'rollupBundle/bundle.js',
  // format: 'cjs',
  external: ['fs'], // tells Rollup 'I know what I'm doing here'
  plugins: [
    nodeResolve({ preferBuiltins: false }), // or `true`
    commonjs(),
    json(),
    // globals(),
    // builtins()
  ]
};
