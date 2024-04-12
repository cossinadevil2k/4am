<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
      <el-button type="primary" size="mini" @click="openAccountDialog" title="新增账号">新增</el-button>
      <el-button :type="isAutoTask ? 'danger' : 'primary'" size="mini" @click="isAutoTask = !isAutoTask">{{ `${isAutoTask ? "关闭" : "开启"}自动做任务` }}</el-button>
      <el-button :type="isAutoLvUp ? 'danger' : 'primary'" size="mini" @click="runAutoLVup">{{ `${isAutoLvUp ? "关闭" : "开启"}自动升级` }}</el-button>
      <el-button :type="isAutoAutoCharge ? 'danger' : 'primary'" size="mini" @click="runAutoCharge">{{ `${isAutoAutoCharge ? "关闭" : "开启"}自动充能` }}</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="名称" min-width="60"></el-table-column>
      <el-table-column prop="spar" label="水晶" min-width="88">
        <template #default="{ row }">
          {{ formatNumber(row.spar) }}
        </template>
      </el-table-column>
      <el-table-column prop="integral" label="币" min-width="60"> </el-table-column>
      <el-table-column prop="speed" label="速度" min-width="88">
        <template #default="{ row }">
          {{ `${formatNumber(row.speed)}/h` }}
        </template>
      </el-table-column>
      <el-table-column prop="energy" label="电池" min-width="60"></el-table-column>
      <el-table-column prop="petLv" label="宠物Lv" min-width="120">
        <template #default="{ row }">
          <div v-if="row.gameData">
            <p>{{ `${row.petLv}(${formatRemainingTime(row.gameData.pet.end_time * 1000)})` }}</p>
            <p style="font-size: 12px">{{ `升级花费：${formatNumber(row.gameData.pet.upNeedSpar)}` }}</p>
            <el-button :loading="row.petLvLoading" type="text" style="margin-left: 5px" @click="roleLvUp(row, 3)"> 升级 </el-button>
            <el-button :loading="row.wakeUpLoading" type="text" style="margin-left: 5px" @click="wakeUp(row)"> 唤醒 </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="roleManLv" label="男矿工Lv" min-width="120">
        <template #default="{ row }">
          <div v-if="row.gameData">
            <p>{{ `${row.roleManLv}(${row.gameData.roleMan.energy}/4)` }}</p>
            <p style="font-size: 12px">{{ `升级花费：${formatNumber(row.gameData.roleMan.upNeedSpar)}` }}</p>
            <el-button :loading="row.manEnergyLoading" type="text" style="margin-left: 5px" @click="useEnergy(row, 1)"> 充电</el-button>
            <el-button :loading="row.manLvLoading" type="text" style="margin-left: 5px" @click="roleLvUp(row, 1)"> 升级</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="roleWomanLv" label="女矿工Lv" min-width="120">
        <template #default="{ row }">
          <div v-if="row.gameData">
            <p>{{ `${row.roleWomanLv}(${row.gameData.roleWoman.energy}/4)` }}</p>
            <p v-if="row.gameData" style="font-size: 12px">{{ `升级花费：${formatNumber(row.gameData.roleWoman.upNeedSpar)}` }}</p>
            <el-button :loading="row.womanEnergyLoading" type="text" style="margin-left: 5px" @click="useEnergy(row, 2)"> 充电</el-button>
            <el-button :loading="row.womanLvLoading" type="text" style="margin-left: 5px" @click="roleLvUp(row, 2)"> 升级</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="bossInfo" label="boss" min-width="100">
        <template #default="{ row }">
          <div v-if="row.bossInfo">
            <p style="font-size: 12px">充能：{{ formatNumber(row.bossInfo.charged) }}</p>
            <p style="font-size: 12px">充能奖励：{{ row.bossInfo.chargeBonus }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="tasklist" label="任务" min-width="100">
        <template #default="{ row }">
          <div v-if="row.tasklist && row.tasklist.length">
            <p v-for="(task, index) in row.tasklist" :key="index" style="font-size: 12px; color: green">{{ `${index + 1}:${task.name}` }}</p>
          </div>
          <el-button v-if="row.tasklist && row.tasklist.length" type="text" :loading="row.taskLoading" @click="doTask(row)">做任务</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="donetasklist" label="完成任务" min-width="120">
        <template #default="{ row }">
          <div v-if="row.donetasklist && row.donetasklist.length">
            <p v-for="(task, index) in row.donetasklist" :key="index" style="font-size: 12px; color: gray">{{ `${index + 1}:${task.name}` }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="hdLog" label="奖品历史" min-width="165">
        <template #default="{ row }">
          <div v-if="row.hdLog && row.hdLog.length">
            <template v-for="(log, index) in row.hdLog">
              <p v-if="log.type === 1" :key="index" style="font-size: 12px; color: gray">{{ `${index + 1}:消耗 ${log.honorPoints} 兑换 ${log.tmark} tmark` }}</p>
              <p v-else :key="index" style="font-size: 12px; color: gray">{{ `${index + 1}:${log.item_name}` }}</p>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120"></el-table-column>
      <el-table-column prop="operate" label="操作" min-width="220">
        <template #default="{ row }">
          <el-popover placement="top" width="240" v-model="row.exchangeVisible">
            <el-slider v-model="row.exchangeValue" :max="row.integral"> </el-slider>
            <el-input-number v-model="row.exchangeValue" :min="0" :max="row.integral" size="mini"></el-input-number>
            <p style="font-size: 12px; color: gray">{{ `兑换：${(row.exchangeValue * 0.012).toFixed(2)} TMARK` }}</p>
            <el-button type="text" @click="row.exchangeValue = row.integral">max</el-button>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="row.exchangeVisible = false">取消</el-button>
              <el-button type="primary" size="mini" @click="exchange(row, row.exchangeValue)">确定</el-button>
            </div>
            <el-button :loading="row.exchangeLoading" type="text" size="mini" slot="reference">兑换</el-button>
          </el-popover>
          <el-button :loading="row.loading" type="text" size="mini" style="margin-left: 10px" @click="getDetail(row)">刷新</el-button>
          <el-button :loading="row.chargeLoading" type="text" size="mini" @click="charge(row)">充能</el-button>
          <el-button :loading="row.lottoLoading" type="text" size="mini" @click="lotto(row)">抽奖</el-button>
          <el-button type="text" size="mini" @click="openAccountDialog(row)">编辑</el-button>
          <el-button type="text" size="mini" @click="removeAccount(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AddDialog ref="addDialog" @success="getList"></AddDialog>
    <template slot="footer-left">
      <el-button type="primary" :loading="batchRunLoading" :disabled="!selectedEmails.length" size="small" @click="batchRunRefresh">批量刷新</el-button>
      <el-button type="primary" :loading="batchRunLoading" :disabled="!selectedEmails.length" size="small" @click="batchRunDraw">批量抽奖</el-button>
      <span style="font-size: 12px; color: gray;margin-left: 10px">{{ `荣誉点总量： ${ totalHonorPoints }` }}</span>
      <!-- <el-button type="danger" :disabled="!selectedEmails.length" size="small">批量删除</el-button> -->
    </template>
    <el-pagination
      slot="footer-right"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageInfo.currentPage"
      :page-sizes="[50, 100, 200, 500]"
      :page-size="pageInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageInfo.total"
    >
    </el-pagination>
  </PageCard>
</template>
<script>
import { mapState } from "vuex"
import AddDialog from "./Dialog/addDialog.vue"
import { list, remove, detail, getDetail, roleLvUp, wakeUp, useEnergy, getSpar, doTask, charge, getLottoIndex, exchange } from "@/api/metaCene"
export default {
  components: { AddDialog },
  data() {
    return {
      tableData: [],
      selectedEmails: [], // 选中的邮箱数组
      groupList: [],
      serachForm: {},
      batchRunLoading: false,
      pageInfo: {
        currentPage: 1,
        pageSize: 50,
        total: 0,
      },
      isAutoLvUp: false,
      isAutoTask: false,
      isAutoAutoCharge: false,
      timeId: null,
      lvUptimeId: null,
      loginTimeId: null,
      autoChargeTimeId: null,
      loading: false,
    }
  },
  computed: {
    ...mapState(["setting"]),
    totalHonorPoints(){
      return this.tableData.reduce((pre, row)=> pre + Number(row.integral), 0)
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    runAutoLVup() {
      clearInterval(this.lvUptimeId)
      if (this.isAutoLvUp) {
        this.isAutoLvUp = false
        return
      }
      this.isAutoLvUp = true
      this.lvUptimeId = setInterval(() => {
        this.batchRun(async (v) => {
          await this.getSpar(v.id)
          const newRow = this.tableData.find((row) => row.id === v.id)
          if (newRow.petLv - newRow.roleManLv > 1 && newRow.spar > newRow.gameData.roleMan.upNeedSpar) {
            await this.roleLvUp(v, 1)
          } else if (newRow.petLv - newRow.roleWomanLv > 1 && newRow.spar > newRow.gameData.roleWoman.upNeedSpar) {
            await this.roleLvUp(v, 2)
          } else if (newRow.spar > newRow.gameData.pet.upNeedSpar) {
            await this.roleLvUp(v, 3)
          }
        }, 10)
      }, 60000)
    },
    runAutoCharge() {
      clearInterval(this.autoChargeTimeId)
      if (this.isAutoAutoCharge) {
        this.isAutoAutoCharge = false
        return
      }
      this.isAutoAutoCharge = true
      this.autoChargeTimeId = setInterval(() => {
        this.tableData.forEach(async (v) => {
          await this.charge(v)
        })
      }, 1000 * 60 * 10)
    },
    async getSpar(id) {
      await getSpar(id)
      await this.update(id)
    },
    async charge(row) {
      row.chargeLoading = true
      await charge({ id: row.id }).finally(async (res) => {
        row.chargeLoading = false
      })
      await this.update(row.id)
    },
    async exchange(row, amount){
      row.exchangeLoading = true
      row.exchangeVisible = false
      await exchange({ id: row.id, amount: amount }).finally(async (res) => {
        row.exchangeLoading = false
      })
      row.exchangeValue = 0
      this.$message.success("成功")
      await this.update(row.id)
    },
    async getList() {
      const { currentPage, pageSize } = this.pageInfo
      this.loading = true
      const res = await list({ currentPage, pageSize, sort: { name: 1 } }).finally(() => {
        this.loading = false
      })
      this.tableData = res.data.list.map((v) => ({
        ...v,
        petLvLoading: false,
        wakeUpLoading: false,
        manLvLoading: false,
        womanLvLoading: false,
        womanEnergyLoading: false,
        manEnergyLoading: false,
        taskLoading: false,
        chargeLoading: false,
        exchangeLoading: false,
        lottoLoading: false,
        loading: false,
        exchangeValue: 0,
        exchangeVisible: false,
      }))
      this.pageInfo.total = res.data.pageInfo.total
      // clearInterval(this.timeId)
      clearInterval(this.loginTimeId)
      // this.timeId = setInterval(() => {
      //   this.tableData = this.tableData.map((v) => {
      //     if (!v.gameData) return v
      //     this.$set(v, "petEndTime", this.formatRemainingTime(v.gameData.pet.end_time * 1000))
      //     return v
      //   })
      // }, 1000)
      this.loginTimeId = setInterval(() => {
        this.batchRun(async (row) => {
          await this.getDetail(row)
          if (this.isAutoTask) {
            setTimeout(() => {
              const newRow = this.tableData.find((v) => v.id === row.id)
              if (newRow.tasklist.length) {
                this.doTask(newRow)
              }
            }, 5000)
          }
          setTimeout(async () => {
            const now = new Date().getTime()

            const newRow = this.tableData.find((v) => v.id === row.id)

            if (newRow.gameData.pet.end_time * 1000 - now <= 1000 * 60 * 60 * 3) {
              await this.wakeUp(newRow)
            }

            if (newRow.gameData.roleMan.energy < 4 && newRow.energy > 0) {
              await this.useEnergy(newRow, 1)
            } else if (newRow.gameData.roleWoman.energy < 4 && newRow.energy > 0) {
              await this.useEnergy(newRow, 2)
            }
          }, 5000)
        })
      }, 1000 * 60 * 5)
    },
    async batchRunRefresh() {
      this.batchRunLoading = true
      await this.batchRun(this.getDetail).finally(() => {
        this.batchRunLoading = false
      })
    },
    async batchRunDraw(){
      this.batchRunLoading = true
      await this.batchRun(this.lotto).finally(() => {
        this.batchRunLoading = false
      })
    },
    async batchRun(fn, max = 5) {
      const maxConcurrentRequests = max // 同时运行的最大请求数量
      let activeRequests = 0 // 当前活跃的请求数量
      let index = 0 // 当前处理到的数组索引

      const handleRequest = async (row) => {
        try {
          await fn(row)
        } catch (error) {
        } finally {
          activeRequests-- // 完成一个请求后，活跃请求数量减1
        }
      }

      const loop = async () => {
        while (index < this.tableData.length) {
          if (activeRequests < maxConcurrentRequests) {
            activeRequests++
            handleRequest(this.tableData[index])
            index++
          } else {
            await new Promise((resolve) => setTimeout(resolve, 100)) // 等待一下再检查
          }
        }
      }

      await loop()

      // 等待所有请求完成
      while (activeRequests > 0) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    },
    async doTask(row) {
      row.taskLoading = true
      await doTask(row.id).finally(() => {
        row.taskLoading = false
      })
      await this.getDetail(row)
    },
    async lotto(row) {
      if (row.integral < 100) return this.$message.error("抽奖券不够")
      row.lottoLoading = true
      const res = await getLottoIndex({ id: row.id }).finally(() => {
        row.lottoLoading = false
      })
      this.$message.success(res.data.item_name)
      row.integral -= 100
    },
    async getDetail(row) {
      row.loading = true
      await getDetail(row.id).finally(() => {
        row.loading = false
      })
      await this.update(row.id)
    },
    async roleLvUp(row, roleId) {
      if (roleId === 1) {
        row.manLvLoading = true
      } else if (roleId === 2) {
        row.womanLvLoading = true
      } else {
        row.petLvLoading = true
      }
      await roleLvUp({ id: row.id, roleId }).finally(() => {
        if (roleId === 1) {
          row.manLvLoading = false
        } else if (roleId === 2) {
          row.womanLvLoading = false
        } else {
          row.petLvLoading = false
        }
      })
      await this.update(row.id)
    },
    async wakeUp(row) {
      row.wakeUpLoading = true
      await wakeUp(row.id).finally(() => {
        row.wakeUpLoading = false
      })
      await this.update(row.id)
    },
    async useEnergy(row, roleId) {
      if (roleId === 1) {
        row.manEnergyLoading = true
      } else if (roleId === 2) {
        row.womanEnergyLoading = true
      }
      await useEnergy({ id: row.id, roleId }).finally(() => {
        if (roleId === 1) {
          row.manEnergyLoading = false
        } else if (roleId === 2) {
          row.womanEnergyLoading = false
        }
      })
      await this.update(row.id)
    },
    async update(id) {
      const data = await detail(id)
      this.tableData = this.tableData.map((v) => {
        if (v.id === id) {
          Object.assign(v, data.data)
          return v
        }
        return v
      })
    },
    formatNumber(num) {
      if (!num) return "0"
      if (num >= 10000000) {
        return (num / 1000000).toFixed(0) + "M"
      } else if (num >= 10000) {
        return (num / 1000).toFixed(0) + "K"
      } else {
        return num.toString()
      }
    },
    formatRemainingTime(deadlineTimestamp) {
      const now = new Date().getTime()
      const remainingMilliseconds = Math.max(0, deadlineTimestamp - now)
      const hours = Math.floor(remainingMilliseconds / (1000 * 60 * 60))
      const minutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000)

      const formattedHours = hours.toString().padStart(2, "0")
      const formattedMinutes = minutes.toString().padStart(2, "0")
      const formattedSeconds = seconds.toString().padStart(2, "0")

      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
      this.pageInfo.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`)
      this.pageInfo.currentPage = val
      this.getList()
    },
    async openAccountDialog(oldForm) {
      this.$refs.addDialog.open(oldForm)
    },
    async removeAccount(row) {
      await this.$confirm("真删?")
      await remove({ ids: [row.id] })
      this.$message.success("删除成功")
      this.getList()
    },
    handleSelectionChange(selection) {
      // selection 是选中的行信息数组
      this.selectedEmails = selection // 假设 id 是邮箱的唯一标识符
    },
  },
}
</script>
<style lang="less" scoped>
.container {
  width: 100%;

  .m-header,
  .m-footer {
    background: #fff;
    padding: 0 20px;
    height: 60px;
    display: flex;
    align-items: center;
    // ::v-deep .el-pagination{
    //     justify-self: flex-end;
    // }
  }
  .m-header {
    margin-bottom: 10px;
  }
  .m-footer {
    height: 50px;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
  }
}
</style>
