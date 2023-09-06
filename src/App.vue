<template>
  <div id="app">
    <Layout>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </Layout>
    <!-- <el-button type="primary" @click="$ipc.send('sui-quest2')"
      >点击开始Sui-Quest2</el-button
    >
    <el-button type="primary" @click="$ipc.send('export-wallet')"
      >点击开始导出钱包数据</el-button
    >
    <el-button type="primary" @click="$ipc.send('send-to-child')"
      >子账户分币</el-button
    > -->
  </div>
</template>
<script>
import Layout from "@/components/Layout";
export default {
  components: {
    Layout,
  },
  created() {
    this.$ipc.on("script-log", (event, message) => {
      console.log(message, "message");
      this.$store.commit("ADD_LOG", message);
    });
  },
  methods: {},
};
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
html,
body,
#app {
  height: 100%;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
