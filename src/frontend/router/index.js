import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/window-manage/list'
  },
  {
    path: "/window-manage/list",
    name: "WindowManage_List",
    component: () => import("@/views/WindowManage/List"),
    meta: {
      title: "窗口列表",
    },
  },
  {
    path: "/window-manage/detail",
    name: "WindowManage_Detail",
    component: () => import("@/views/WindowManage/List/Detail"),
    meta: {
      title: "窗口列表",
    },
  },
  {
    path: "/activity-manage/over-wallet",
    name: "ActivityManage_OverWallet",
    component: () => import("@/views/ActivityManage/OverWallet"),
    meta: {
      title: "OverWallet",
    },
  },
  {
    path: "/setting/system",
    name: "Setting_System",
    component: () => import("@/views/Setting/System"),
    meta: {
      title: "系统设置",
    },
  },
  {
    path: "/log/script",
    name: "Log_Script",
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
