<template>
  <div id="app">
    <Layout>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </Layout>
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
