/* eslint-disable */

const path = require('path');

module.exports = function override(config, env) {
  const rule = config.module.rules[1];
  rule.oneOf.splice(0, 0, {
    test: /scribblefs\/index\.ts$/,
    include: path.resolve('src/scribblefs'),
    loader: require.resolve('babel-loader'),
    options: {
      plugins: ['./util/coredoc-babel-loader.js'],
      presets: [
        [
          require.resolve('babel-preset-react-app'),
          {
            runtime: 'automatic',
          },
        ],
      ],
      babelrc: false,
      configFile: false,
    },
  });

  return config;
}
