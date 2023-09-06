// vue.config.js
module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      mainProcessWatch: ["script/"],
    //   chainWebpackMainProcess: (config) => {
    //     // Chain webpack config for electron main process only
    //     config.module
    //       .rule("js")
    //       .use("babel-loader")
    //       .loader("babel-loader")
    //       .end();
    //   },
    //   chainWebpackRendererProcess: (config) => {
    //     // Chain webpack config for electron renderer process only (won't be applied to web builds)
    //     config.module
    //       .rule("js")
    //       .use("babel-loader")
    //       .loader("babel-loader")
    //       .end();
    //   },
    },
  },
};
