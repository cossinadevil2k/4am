// datastore.js
import Vue from "vue";
import Datastore from "nedb-promises";
const { app } = require("@electron/remote");

const basePath = app.getPath("userData");
// 创建一个表
const db = {
  OverWalletAcount: Datastore.create({
    autoload: true,
    filename: basePath + "/nedb/overwalletAcoount",
  }),
};
// 挂载到vue上
Vue.prototype.$db = db;
