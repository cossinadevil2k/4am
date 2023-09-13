// vue.config.js
module.exports = {
  configureWebpack: {
    entry: {
      app: "/src/frontend/main.js",
    },
    resolve: {
      alias: {
        "@": "/src/frontend",
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
      },
    },
  },
  devServer: {
    port: 8080,
  },
}
