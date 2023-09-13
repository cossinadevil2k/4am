import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUi from "@/common/element-ui";
import PageCard from "@/components/PageCard";
import './plugins/datastore.js' 
import { ipcRenderer } from "electron"
Vue.prototype.$ipc = ipcRenderer;
Vue.config.productionTip = false;
console.log(process.env, "rocess.env")

Vue.use(ElementUi);
Vue.component("PageCard", PageCard);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
