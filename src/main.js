import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUi from "@/common/element-ui";
import PageCard from "@/components/PageCard";
Vue.prototype.$ipc = window.ipc;
Vue.config.productionTip = false;

Vue.use(ElementUi);
Vue.component("PageCard", PageCard);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
