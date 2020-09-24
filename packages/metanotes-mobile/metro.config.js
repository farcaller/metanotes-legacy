const { createMetroConfiguration } = require('expo-yarn-workspaces');

const config = createMetroConfiguration(__dirname);

config.resolver.extraNodeModules.path = require('node-libs-react-native').path;

module.exports = config;
