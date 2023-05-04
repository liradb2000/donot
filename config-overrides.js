// const lodashCloneDeep = require("lodash/cloneDeep");
const { ProvidePlugin } = require("webpack");
module.exports = {
  webpack: function override(config, env) {
    // const isEnvDevelopment = env === "development";

    // const rules = config.module.rules.find((rule) => !!rule.oneOf).oneOf;

    // const babelLoader = rules.find(
    //   (rule) => rule.loader && rule.loader.includes("babel") && rule.include
    // );

    // const workerLoader = lodashCloneDeep(babelLoader);
    // console.log(workerLoader.loader);
    // workerLoader.test = /\.worker\.js$/;
    // workerLoader.use = [
    //   { loader: "worker-loader" },
    //   {
    //     // Old babel-loader configuration goes here.
    //     loader: workerLoader.loader,
    //     options: workerLoader.options,
    //   },
    // ];
    // delete workerLoader.loader;
    // delete workerLoader.options;

    // babelLoader.exclude = (babelLoader.exclude || []).concat([
    //   /\.worker\.js$/,
    // ]);

    // config.module.rules.push(workerLoader);
    config.resolve.fallback = {
      util: require.resolve("util/"),
      buffer: require.resolve("buffer"),
      fs: false,
    };
    config.plugins.push(
      new ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );
    return config;
  },
};
