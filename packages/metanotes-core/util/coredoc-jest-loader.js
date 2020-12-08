const babelJest = require('babel-jest');

// lifted off https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/jest/babelTransform.js

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch (e) {
    return false;
  }
})();

const bjt = babelJest.createTransformer({
  plugins: ['./util/coredoc-babel-loader.js'],
  presets: [
    [
      require.resolve('babel-preset-react-app'),
      {
        runtime: hasJsxRuntime ? 'automatic' : 'classic',
      },
    ],
  ],
  babelrc: false,
  configFile: false,
});

module.exports = {
  // canInstrument: bjt.canInstrument,
  // createTransformer: bjt.createTransformer,
  getCacheKey: () => {
    const u = require('ulid');
    return u.ulid();
  },
  process: bjt.process,
};
