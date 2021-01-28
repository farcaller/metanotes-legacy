import commonjs from '@rollup/plugin-commonjs';

export default {
  context: '(undefined)',
  external: ['fs'],
  plugins: [
    commonjs(),
  ]
};
