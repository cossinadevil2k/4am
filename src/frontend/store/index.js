import Vue from "vue"
import Vuex from "vuex"
import dayjs from "dayjs"
import { local } from '@/utils/storage'
Vue.use(Vuex)
// 动态设置主题
function setTheme(themeName) {
  let linkElement = document.getElementById("dynamic-theme")
  if (!linkElement) {
    linkElement = document.createElement("link")
    linkElement.setAttribute("rel", "stylesheet")
    linkElement.setAttribute("id", "dynamic-theme")
    document.head.appendChild(linkElement)
  }
  linkElement.setAttribute("href", `theme/${themeName}.css`)
}
const setting = local.get("setting") || {}

window.addEventListener("load", () => {
  setTheme(setting.darkMode ? "theme-dark" : "theme-light")
})
export default new Vuex.Store({
  state: {
    setting: setting || {},
    logs: [
      {
        log: "0x6ca2f5beb64749ea00c45aad7ac00a4f62e6ed32a5a0089f63230d20aceca5bc",
        time: "2021-01-01 00:00:00",
      },
    ],
  },
  mutations: {
    UPDATE_SETTING(state, setting) {
      setTheme(setting.darkMode ? "theme-dark" : "theme-light")
      state.setting = setting
      local.set("setting", setting)
    },
    ADD_LOG(state, log) {
      state.logs.push({ log, time: dayjs().format("YYYY-MM-DD HH:mm:ss") })
    },
    CLEAR_LOG(state) {
      state.logs = []
    },
  },
  actions: {},
  modules: {},
})
