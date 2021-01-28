const path = require('path');
const { stringify } = require('querystring');
const { merge } = require('webpack-merge');

module.exports = {
  babelConfigModifier: (defaultBabelConfiguration) => {
    // console.log(JSON.stringify(defaultBabelConfiguration));
    defaultBabelConfiguration.plugins.push('babel-plugin-transform-mjs-imports');
    return defaultBabelConfiguration;
    // return babelConfiguration(defaultBabelConfiguration);
  },
  webpackConfigModifier: (defaultConfig) => {
    return merge(defaultConfig, {
      module: {
        // rules: [
        //   {
        //     test: /\.ts$/,
        //     loader: 'ts-loader',
        //   }
        // ]
        rules: [
          {
            test: /\.mjs$/, //using regex to tell babel exactly what files to transcompile
            exclude: /node_modules/, // files to be ignored
            use: {
              loader: 'babel-loader' // specify the loader
            }
          }
        ]
      },

      resolve: {
        // extensions: ['.ts', 'js'],
        alias: {
          // 'metanotes/src': path.resolve(__dirname, '..'),
          'metanotes': path.resolve(__dirname, 'metanotes'),
        },
      },
      
      stats: {
        // suppress "export not found" warnings about re-exported types
        warningsFilter: /export .* was not found in/
      },

      node: {
        __dirname: false,
      },
      // plugins: ['babel-plugin-transform-mjs-imports'],
    })
  }
}
