<template>
  <el-container style="height: 100%; border: 1px solid var(--bg-color-base)">
    <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
      <el-menu router>
        <el-submenu v-for="(item, index) in menus" :key="index" :index="`${index}`">
          <template slot="title"><i :class="item.icon"></i>{{ item.name }}</template>
          <el-menu-item v-for="(submenu, subIndex) in item.children" :key="`${index}-${subIndex}`" :index="submenu.path">{{ submenu.name }}</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>

    <el-container class="page-view">
      <slot></slot>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menus: [
        {
          name: "资源管理",
          icon: "el-icon-menu",
          children: [
            {
              name: "窗口管理",
              path: "/asset-manage/window-manage",
            },
            {
              name: "邮箱管理",
              path: "/asset-manage/email-manage",
            },
          ],
        },
        {
          name: "活动管理",
          icon: "el-icon-s-flag",
          children: [
            {
              name: "OverWallet",
              path: "/activity-manage/over-wallet",
            },
          ],
        },
        {
          name: "日志",
          icon: "el-icon-bell",
          children: [
            {
              name: "脚本日志",
              path: "/log/script",
            },
          ],
        },
        {
          name: "设置",
          icon: "el-icon-setting",
          children: [
            {
              name: "系统设置",
              path: "/setting/system",
            },
            {
              name: "Over设置",
              path: "/setting/over",
            },
          ],
        },
      ],
    }
  },
}
</script>
<style lang="less">
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
  background-color: #fff;
}
.el-menu {
  height: 100%;
  text-align: left;
  .el-menu-item {
    font-size: 12px;
    padding-left: 50px !important;
  }
}
</style>
<style lang="less" scoped>
.page-view {
  padding: 20px;
  background: var(--bg-color-base);
  padding-bottom: 40px;
}
</style>
