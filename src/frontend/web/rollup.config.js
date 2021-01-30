import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from "rollup-plugin-replace";
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const prod = true;

export default {
  context: '(undefined)',
  plugins: [
    nodeResolve({
      preferBuiltins: false,
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development"),
    }),
    commonjs({
      requireReturnsDefault: (mod) => {
        console.log(mod);
        if (mod === 'node_modules/react/index.js') {
          return 'preferred';
        }
        return false;
      },
    }),
    json(),
    nodePolyfills(),
    // globals(),
    // builtins(),
  ],
  output: {
    exports: 'auto',
  },
};
