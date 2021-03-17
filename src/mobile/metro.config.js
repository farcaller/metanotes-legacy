/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  // projectRoot: '',  // TODO: do we actually need this?
  resolver: {
    resolveRequest: (_context, realModuleName, platform, moduleName) => {
      console.log(`[METRO] Resolving: ${moduleName}`);
      throw Error(`Cannot resolve ${moduleName}`);
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
