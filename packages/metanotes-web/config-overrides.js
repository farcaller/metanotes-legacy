/* eslint-disable */

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

class TouchBuildPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('TouchBuild', (
      stats /* stats is passed as an argument when done hook is tapped.  */
    ) => {
      fs.closeSync(fs.openSync(path.resolve('build/index-ssr.js'), 'w'));
    });
  }
}

module.exports = function override(config, env) {
  config.entry = path.resolve('src/index-ssr.tsx');
  config.target = 'node';
  config.output.path = path.resolve('build-ssr');
  config.output.filename = 'index-ssr.js';
  config.output.chunkFilename = 'static/js/[name].chunk.js';
  delete config.optimization.splitChunks.chunks;
  config.optimization.runtimeChunk = false;

  config.plugins.push(new webpack.optimize.LimitChunkCountPlugin({
    maxChunks: 1,
  }));
  config.plugins.push(new TouchBuildPlugin());
  config.plugins.push(new webpack.DefinePlugin({
    BUILD_DIR: JSON.stringify(path.resolve('build')),
    INDEX_TEMPLATE: JSON.stringify(path.resolve('build/index.html')),
  }));

  return config;
}
