module.exports = {
  webpack5: false,
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: 'empty'
      }
    }
    

    return config
  }
  // exportPathMap: async function (defaultPathMap) {
  //   const pathMap = {};

  //   for (const [path, config] of Object.entries(defaultPathMap)) {
  //     if (path === "/") {
  //       pathMap[path] = config;
  //     } else {
  //       pathMap[`${path}/index`] = config;
  //     }
  //   }

  //   return pathMap;
  // }
}
