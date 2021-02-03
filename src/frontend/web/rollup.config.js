import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const prod = true;

export default {
  context: '(undefined)',
  plugins: [
    nodeResolve({
      preferBuiltins: false,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(prod ? 'production' : 'development'),
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
