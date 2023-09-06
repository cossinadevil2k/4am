<template>
  <PageCard>
    <template #header-right>
      <el-button type="text" @click="timeVisible = !timeVisible"
        >{{ timeVisible ? "隐藏" : "显示" }}时间</el-button
      >
    </template>
    <div class="log-main">
      <div v-for="(log, idx) in logs" :key="idx" class="log-item">
        <span class="log">
          {{ log.log }}
        </span>
        <span v-if="timeVisible" class="time">{{ log.time }}</span>
      </div>
    </div>
    <template #footer-right>
      <el-button @click="clear">清空</el-button>
    </template>
  </PageCard>
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      timeVisible: true,
    };
  },
  computed: {
    ...mapState(["logs"]),
  },
  mounted() {},
  methods: {
    clear() {
      this.$store.commit("CLEAR_LOG");
    },
  },
};
</script>
<style lang="less" scoped>
.log-main {
  width: 100%;
  height: 100%;
  background-color: #0f0f1b;
  text-align: left;
  padding: 20px;
  overflow: auto;
  .log-item {
    color: #fff;
    position: relative;
    font-size: 14px;
    .time {
      font-size: 12px;
      color: #cecece;
      user-select: none;
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>
