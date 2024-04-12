import Vue from "vue";
import VueRouter from "vue-router";
Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/asset-manage/window-manage'
  },
  {
    path: "/asset-manage/window-manage",
    name: "AssetManage_WindowManage",
    component: () => import("@/views/AssetManage/WindowManage"),
    meta: {
      title: "窗口管理",
    },
  },
  {
    path: "/asset-manage/email-manage",
    name: "AssetManage_EmailManage",
    component: () => import("@/views/AssetManage/EmailManage"),
    meta: {
      title: "邮箱管理",
    },
  },
  {
    path: "/asset-manage/email-manage/mail-list",
    name: "AssetManage_EmailManage_MailList",
    component: () => import("@/views/AssetManage/EmailManage/Child/MailList"),
    meta: {
      title: "邮件列表",
    },
  },
  {
    path: "/asset-manage/wallet-manage",
    name: "AssetManage_WalletManage",
    component: () => import("@/views/AssetManage/WalletManage"),
    meta: {
      title: "钱包管理",
    },
  },
  {
    path: "/asset-manage/wallet-manage/wallet-detail",
    name: "AssetManage_WalletManage_WalletDetail",
    component: () => import("@/views/AssetManage/WalletManage/Child"),
    meta: {
      title: "钱包详情",
    },
  },
  {
    path: "/activity-manage/meta-cene",
    name: "ActivityManage_xMetaCene",
    component: () => import("@/views/ActivityManage/xMetaCene"),
    meta: {
      title: "xMetaCene",
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
    path: "/activity-manage/A0GI",
    name: "ActivityManage_A0GI",
    component: () => import("@/views/ActivityManage/A0GI"),
    meta: {
      title: "A0GI"
    }
  },
  {
    path: "/activity-manage/A0GI/A0GI-detail",
    name: "ActivityManage_A0GI_Detail",
    component: () => import("@/views/ActivityManage/A0GI/Child"),
    meta: {
      title: ""
    }
  },
  // {
  //   path: "/activity-manage/sui-lette",
  //   name: "ActivityManage_SuiLette",
  //   component: () => import("@/views/ActivityManage/SuiLette"),
  //   meta: {
  //     title: "SuiLette",
  //   },
  // },
  // {
  //   path: "/activity-manage/sui-quest3-rank",
  //   name: "ActivityManage_SuiQuest3Rank",
  //   component: () => import("@/views/ActivityManage/SuiQuest3Rank"),
  //   meta: {
  //     title: "SuiQuest3Rank",
  //   },
  // },
  // {
  //   path: "/activity-manage/sui-quest3-rank-self",
  //   name: "ActivityManage_SuiQuest3RankSelf",
  //   component: () => import("@/views/ActivityManage/SuiQuest3RankSelf"),
  //   meta: {
  //     title: "SuiQuest3RankSelf",
  //   },
  // },
  {
    path: "/setting/system",
    name: "Setting_System",
    component: () => import("@/views/Setting/System"),
    meta: {
      title: "系统设置",
    },
  },
  {
    path: "/setting/over",
    name: "Setting_Over",
    component: () => import("@/views/Setting/Over"),
    meta: {
      title: "Over设置",
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
