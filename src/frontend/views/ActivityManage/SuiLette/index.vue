<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button v-if="watching" type="danger" size="mini" @click="stopWatch" title="刷新列表">停止监控</el-button>
      <el-button v-if="catching" type="danger" size="mini" @click="stopPlayer" title="刷新列表">停止抓用户</el-button>
      <el-button type="primary" :loading="watching" size="mini" @click="getHistory" title="刷新列表">{{ watching ? "监控中" : "开始监控" }}</el-button>
      <el-button type="primary" :loading="catching" size="mini" @click="getPlayer" title="刷新列表">{{ catching ? "抓用户中" : "开始抓用户" }}</el-button>
    </el-row>
    <div class="result-box">
      <div class="result" v-for="item in tableData" :key="item.id" :class="getClass(item)" :title="item.createTimeStr">
        {{ item.resultRoll === 37 ? "00" : item.resultRoll }}
      </div>
    </div>
  </PageCard>
</template>
<script>
import { getHistory, getPlayer, stopPlayer, stopWatch, getHistoryRecord } from "@/api/quest3"
export default {
  data() {
    return {
      tableData: [],
      watching: false,
      catching: false,
    }
  },
  computed: {},
  mounted() {
    this.getList()
  },
  methods: {
    async getList() {
      const res = await getHistoryRecord()
      this.tableData = []
      res.data.forEach((v, i) => {
        this.tableData.push(v)
        if (!v.lastId && i !== res.data.length - 1) {
          this.tableData.push({
            id: parseInt(Math.random() * 100000),
            resultRoll: "??",
            createTime: null,
          })
        }
      })
      console.log(res.data)
    },
    async getHistory() {
      this.watching = true
      setTimeout(() => {
        this.getList()
      }, 5000)
      const timer = setInterval(() => {
        this.getList()
      }, 30000)
      await getHistory().finally(() => {
        this.watching = false
        clearInterval(timer)
      })
    },
    async getPlayer() {
      this.catching = true
      await getPlayer().finally(() => {
        this.catching = false
      })
    },
    async stopWatch() {
      await stopWatch()
    },
    async stopPlayer() {
      await stopPlayer()
    },
    getClass(item) {
      if (item.resultRoll === "??") return "yellow"
      if (item.resultRoll === 0 || item.resultRoll === 37) return "blue"
      if ([1, 3, 5, 7, 9, 12, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(item.resultRoll)) return "red"
      return "black"
    },
  },
}
</script>
<style lang="less" scoped>
.result-box {
  display: flex;
  justify-content: flex-start;
  align-content: flex-start;
  flex-wrap: wrap;
  height: 100%;
  overflow-y: auto;
  .result {
    width: 40px;
    height: 40px;
    margin-right: 10px;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid #fff;
    color: white;
    font-size: 18px;
    font-weight: bold;
    &.blue {
      background: skyblue;
      border: 1px solid skyblue;
    }
    &.red {
      background: red;
      border: 1px solid red;
    }
    &.black {
      background: black;
      border: 1px solid black;
    }
    &.yellow {
      background: yellow;
      border: 1px solid yellow;
      color: blue;
    }
  }
}
</style>
