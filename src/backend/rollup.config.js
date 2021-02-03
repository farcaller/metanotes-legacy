import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  plugins: [
    // nodeResolve(),
    commonjs(),
    // json(),
  ],
  output: {
    exports: 'auto',
    externalLiveBindings: false,
    strict: true,
    sourcemap: false,
  },
};
