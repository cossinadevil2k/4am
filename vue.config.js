// vue.config.js
module.exports = {
  configureWebpack: {
    entry: {
      app: "/src/frontend/main.js",
    },
    resolve: {
      alias: {
        "@": "/src/frontend",
        SHARE: "/src/shared",
        // ... 更多别名
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      mainProcessWatch: ["src/backend"],
      nodeIntegration: true,
      chainWebpackMainProcess: (config) => {
        // 设置主进程的别名
        config.resolve.alias.set("@", "/src/backend")
        config.resolve.alias.set("SHARE", "/src/shared")
        // 转译项目中的所有代码，但排除所有第三方库
        config.module
          .rule("js")
          .test(/\.(js)$/) // 添加 cjs 和 mjs
          .exclude.add(/node_modules/)
          .end()
          .use("babel-loader")
          .loader("babel-loader")
          .end()
        config.module
          .rule("js-all")
          .test(/\.(cjs|mjs)$/) // 添加 cjs 和 mjs
          .type("javascript/auto")
          .use("babel-loader")
          .loader("babel-loader")
          .end()
        //   .exclude.add(/node_modules/) // 排除所有第三方库
        //   .end()

        // // 只转译特定的第三方库
        // config.module
        //   .rule("js-for-selected-libraries")
        //   .test(/\.(js|cjs|mjs)$/) // 添加 cjs 和 mjs
        //   .include.add(/node_modules\/(html-to-text|mailparser)/) // 指定需要转译的第三方库
        //   .end()
        //   .use("babel-loader")
        //   .loader("babel-loader")
      },
    },
  },
  devServer: {
    port: 8080,
  },
}
