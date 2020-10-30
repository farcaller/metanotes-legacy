module.exports = {
  apps : [
    // build only
    {
      name: 'remark-metareact',
      script: 'yarn workspace @metanotes/remark-metareact build:watch',
    },
    {
      name: 'filter',
      script: 'yarn workspace @metanotes/filter build:watch',
    },
    {
      name: 'store',
      script: 'yarn workspace @metanotes/store build:watch',
    },
    {
      name: 'server-api',
      script: 'yarn workspace @metanotes/server-api build:watch',
    },

    // backend
    {
      name: 'server',
      script: 'yarn workspace metanotes-server start:watch',
      watch: './packages/metanotes-server/src'
    },
    {
      name: 'server-envoy',
      script: 'yarn workspace metanotes-server start:envoy',
      watch: './packages/metanotes-server/envoy-config.yaml'
    },

    // apps
    {
      name: 'core',
      script: 'yarn workspace metanotes-core start',
    },
  ],
};
