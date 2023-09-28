// vue.config.js
const webpack = require('webpack');
const packageJson = require('./package.json');

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
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          VUE_APP_VERSION: JSON.stringify(packageJson.version),
        },
      }),
    ],
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
          .exclude.add((filepath) => {
            // 排除 node_modules 目录下的文件，但允许 node_modules/socks-proxy-agent
            return filepath.includes("node_modules") && !filepath.includes("socks-proxy-agent")
          })
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
      },
      builderOptions: {
        publish: ["github"],
        appId: "com.4am.bot",
        win: {
          target: "nsis",
          icon: "./public/icon.ico",
        },
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
        },
      },
    },
  },
  devServer: {
    port: 8080,
  },
}
