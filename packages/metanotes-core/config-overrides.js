/* eslint-disable */

const path = require('path');

module.exports = function override(config, env) {
  const rule = config.module.rules[1];
  rule.oneOf.splice(0, 0, {
    test: /\.metanotes\.jsx$/,
    include: path.resolve('src/scribblefs'),
    loader: path.resolve('util/coredoc-loader.js'),
  });

  return config;
}
