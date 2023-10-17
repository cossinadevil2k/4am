<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="importDb">导入</el-button>
      <el-button type="primary" size="mini" @click="exportDb">导出</el-button>
    </el-row>
    <div class="result-box">
      <div class="result" v-for="item in tableData" :key="item.id" :class="getClass(item)" :title="item.createTimeStr">
        {{ item.resultRoll === 37 ? "00" : item.resultRoll }}
      </div>
    </div>
    <template slot="footer-left">
      <el-button :type="watching ? 'danger' : 'primary'" size="mini" @click="getHistory">{{ watching ? "停止监控" : "开始监控" }}</el-button>
      <el-button :type="catching ? 'danger' : 'primary'" size="mini" @click="getPlayer">{{ catching ? "停止抓用户" : "开始抓用户" }}</el-button>
      <el-button type="primary" size="small" @click="openDialog">统计安全数字</el-button>
    </template>
    <template slot="footer-right">
      <el-button type="text" size="small">沉没数量：{{ hitCount }}</el-button>
    </template>
    <SafeNumber ref="safeNumber" @success="checkSafeNumber" />
  </PageCard>
</template>
<script>
import { getHistory, getPlayer, stopPlayer, stopWatch, getHistoryRecord } from "@/api/quest3"
import { exportDbWithOption, importDbAll } from "@/api/system"
import SafeNumber from "./Dialog/safeNumber.vue"
export default {
  components: { SafeNumber },
  data() {
    return {
      tableData: [],
      watching: false,
      catching: false,
    }
  },
  computed: {
    hitCount() {
      return this.tableData.reduce((pre, v) => {
        return [0, 37].includes(v.resultRoll) && v.highlight ? ++pre : pre
      }, 0)
    },
  },
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
      if (this.watching) {
        return this.stopWatch()
      }
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
      if (this.catching) {
        return this.stopPlayer()
      }
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
      let className = ""
      if (item.highlight) className = "highlight "
      if (item.resultRoll === "??") return "yellow"
      if (item.resultRoll === 0 || item.resultRoll === 37) return className + "blue"
      if ([1, 3, 5, 7, 9, 12, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(item.resultRoll)) return "red"
      return "black"
    },
    checkSafeNumber(form) {
      const { number } = form
      if (!number) return
      this.tableData = this.tableData.map((v, i) => {
        return {
          ...v,
          highlight: [0, 37].includes(this.tableData[i + +number]?.resultRoll || -1),
        }
      })
    },
    openDialog() {
      this.$refs.safeNumber.open()
    },
    exportDb() {
      exportDbWithOption({ names: ["sui_lette"] })
    },
    async importDb() {
      await this.$confirm("导入会覆盖原有数据,谨慎操作")
      await importDbAll()
      this.getList()
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
    &.highlight {
      background: purple;
      border: 2px solid purple;
      color: skyblue;
      font-size: 20px;
      // transform: ;
      &.blue {
        color: red;
      }
    }
  }
}
</style>
