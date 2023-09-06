import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const routes = [
  {
    path: "/window-manage/list",
    name: "WindowManageList",
    component: () => import("@/views/WindowManage/List"),
    meta: {
      title: "窗口列表",
    },
  },
  {
    path: "/window-manage/detail",
    name: "WindowManageDetail",
    component: () => import("@/views/WindowManage/List/Detail"),
    meta: {
      title: "窗口列表",
    },
  },
  {
    path: "/setting/system",
    name: "SettingSystem",
    component: () => import("@/views/Setting/System"),
    meta: {
      title: "系统设置",
    },
  },
  {
    path: "/log/script",
    name: "LogScript",
    component: () => import("@/views/Log/ScriptLog"),
    meta: {
      title: "脚本日志",
    },
  },

];

const router = new VueRouter({
  routes,
});

export default router;
