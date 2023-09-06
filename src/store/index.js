import Vue from "vue";
import Vuex from "vuex";
import dayjs from "dayjs";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    setting: {
      password: "",
    },
    logs: [
      {
        log: "0x6ca2f5beb64749ea00c45aad7ac00a4f62e6ed32a5a0089f63230d20aceca5bc",
        time: "2021-01-01 00:00:00",
      },
    ],
  },
  mutations: {
    UPDATE_SETTING(state, setting) {
      state.setting = setting;
    },
    ADD_LOG(state, log) {
      state.logs.push({ log, time: dayjs().format("YYYY-MM-DD HH:mm:ss") });
    },
    CLEAR_LOG(state) {
      state.logs = [];
    },
  },
  actions: {},
  modules: {},
});
