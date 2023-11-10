<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="importDb">导入</el-button>
      <el-button type="primary" size="mini" @click="exportDb">导出</el-button>
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
      <el-button type="primary" size="mini" @click="openAccountDialog" title="新增账号">新增</el-button>
      <el-button type="primary" size="mini" @click="() => $refs.addMultiDialog.open()" title="批量新增">批量新增</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="address" label="地址" min-width="80">
        <template #default="{ row }">
          <el-button type="text" :title="row.address" @click="$copy(row.address)">{{ fmtAddr(row.address) }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="suins" label="域名" min-width="80">
        <template #default="{ row }">
          {{ (row.suins && row.suins.replace(".sui", "")) || "-" }}
        </template>
      </el-table-column>
      <el-table-column prop="score" label="总分" min-width="110">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "score", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "score", false).prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'score', false).color }">{{ `(${getHistory(row, "score", false).diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="rank" label="排名" min-width="100">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ row.rankData.rank }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "rank", false).prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'rank', false).color }">{{ `(${getHistory(row, "rank", false).diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="REFERRAL_POINTS_ELIGIBLE_SUM" label="邀请" min-width="90">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "REFERRAL_POINTS_ELIGIBLE_SUM", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "REFERRAL_POINTS_ELIGIBLE_SUM").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'REFERRAL_POINTS_ELIGIBLE_SUM').color }">{{ `${getHistory(row, "REFERRAL_POINTS_ELIGIBLE_SUM").diff}` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="DESUICOINFLIP" label="硬币" min-width="90">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "DESUICOINFLIP", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "DESUICOINFLIP").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'DESUICOINFLIP').color }">{{ `${getHistory(row, "DESUICOINFLIP").diff}` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="SUILETTE" label="转盘" min-width="90">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "SUILETTE", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "SUILETTE").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'SUILETTE').color }">{{ `(${getHistory(row, "SUILETTE").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="POETRY_IN_MOTION" label="诗歌" min-width="90">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "POETRY_IN_MOTION", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "POETRY_IN_MOTION").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'POETRY_IN_MOTION').color }">{{ `(${getHistory(row, "POETRY_IN_MOTION").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="THE_COLLECTION" label="绘画" min-width="70">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "THE_COLLECTION", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "THE_COLLECTION").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'THE_COLLECTION').color }">{{ `(${getHistory(row, "THE_COLLECTION").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="RUN_LEGENDS" label="跑步" min-width="110">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "RUN_LEGENDS", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "RUN_LEGENDS").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'RUN_LEGENDS').color }">{{ `(${getHistory(row, "RUN_LEGENDS").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="BUSHI" label="BUSHI" min-width="120">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "BUSHI", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "BUSHI").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'BUSHI').color }">{{ `(${getHistory(row, "BUSHI").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="PANZERDOG" label="坦克" min-width="100">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "PANZERDOG", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "PANZERDOG").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'PANZERDOG').color }">{{ `(${getHistory(row, "PANZERDOG").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="HAS_SUINS" label="域名" min-width="120">
        <template #default="{ row }">
          <span v-if="row.rankData && row.rankData.metadata">{{ row.rankData.metadata.HAS_SUINS }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column> -->
      <el-table-column prop="WORLDS_BEYOND" label="WB" min-width="120">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "WORLDS_BEYOND", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "WORLDS_BEYOND").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'WORLDS_BEYOND').color }">{{ `(${getHistory(row, "WORLDS_BEYOND").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="ARCADE_CHAMPION" label="街机" min-width="100">
        <template #default="{ row }">
          <div v-if="row.rankData" class="score-box">
            <div>
              <span>{{ getHistory(row, "ARCADE_CHAMPION", false).newData }}/</span>
              <span style="color: #ccc">{{ `${getHistory(row, "ARCADE_CHAMPION").prevData}` }}</span>
            </div>
            <span :style="{ color: getHistory(row, 'ARCADE_CHAMPION').color }">{{ `(${getHistory(row, "ARCADE_CHAMPION").diff})` }}</span>
          </div>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="更新时间" min-width="100"> </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="60"> </el-table-column>
      <!-- <el-table-column prop="created_at" label="创建时间" min-width="140"></el-table-column> -->
      <el-table-column prop="operate" label="操作" min-width="120">
        <template #default="{ row }">
          <el-button type="text" size="mini" :loading="row.loading" @click="updateRank(row)">更新</el-button>
          <el-button type="text" size="mini" @click="openAccountDialog(row)">编辑</el-button>
          <el-button type="text" size="mini" @click="removeAccount(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AddDialog ref="addDialog" @success="getList"></AddDialog>
    <AddMultiDialog ref="addMultiDialog" @success="getList"></AddMultiDialog>

    <template slot="footer-left">
      <el-button type="primary" :loading="allRunLoading" @click="allUpdate" size="small">全量更新</el-button>
      <el-button type="primary" :loading="batchRunLoading" @click="batchUpdate" :disabled="!selectedEmails.length || allRunLoading" size="small">批量更新</el-button>
      <el-button type="primary" @click="exportLink" :disabled="!selectedEmails.length" size="small">导出邀请链接</el-button>
      <el-button type="primary" @click="exportAddress" :disabled="!selectedEmails.length" size="small">导出已选地址</el-button>
      <el-button type="danger" @click="batchDelete" :disabled="!selectedEmails.length" size="small">批量删除</el-button>
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
import AddMultiDialog from "./Dialog/addMultiDialog.vue"
import { list, updateRank, updateRankAll, remove, exportDb, importDb } from "@/api/suiRank"
export default {
  components: { AddDialog, AddMultiDialog },
  data() {
    return {
      tableData: [],
      selectedEmails: [], // 选中的邮箱数组
      groupList: [],
      serachForm: {},
      pageInfo: {
        currentPage: 1,
        pageSize: 50,
        total: 0,
      },
      loading: false,
      batchRunLoading: false,
      allRunLoading: false,
    }
  },
  computed: {
    ...mapState(["setting"]),
  },
  mounted() {
    this.getList()
  },
  methods: {
    getHistory(row, key, isFloat = true) {
      const newData = row?.rankData?.[key] || 0
      const prevData = row?.historyRankData?.[key] || 0
      const diff = Math.abs(newData - prevData)
      const color = newData - prevData >= 0 ? "red" : "green"
      return {
        newData: newData.toFixed(0),
        prevData: isFloat ? prevData?.toFixed(0) : prevData.toFixed(0),
        diff: `${newData - prevData >= 0 ? "+" : "-"}${isFloat ? diff.toFixed(0) : diff.toFixed(0)}`,
        color,
      }
    },
    async importDb() {
      await importDb()
      this.getList()
    },
    async exportDb() {
      await exportDb()
    },
    fmtAddr(address) {
      const middle = address.slice(3, -4)
      return address.replace(middle, "**")
    },
    async getList() {
      const { currentPage, pageSize } = this.pageInfo
      this.loading = true
      const res = await list({ currentPage, pageSize }).finally(() => {
        this.loading = false
      })
      this.tableData = res.data.list.map((v) => ({ ...v, loading: false }))
      console.log(this.pageInfo, res)
      this.pageInfo.total = res.data.pageInfo.total
    },
    exportLink() {
      const str = this.selectedEmails.map((v) => `http://quests.mystenlabs.com/referrals/${v.address}`)
      this.$copy(str.join("\r\n"))
      this.$message.success("复制成功！")
    },
    exportAddress(){
      const str = this.selectedEmails.map(v => v.address)
      this.$copy(str.join("\r\n"))
      this.$message.success("复制成功!")
    },
    async openAccountDialog(oldForm) {
      this.$refs.addDialog.open(oldForm)
    },
    async updateRank(row) {
      row.loading = true
      await updateRank({ id: row.id }).finally(() => {
        row.loading = false
      })
      await this.getList()
    },
    async allUpdate() {
      await this.$confirm(`全量更新大约需要${parseInt(this.pageInfo.total / 3)}秒`)
      this.allRunLoading = true
      await updateRankAll().finally(() => {
        this.allRunLoading = false
      })
      this.getList()
    },
    async batchUpdate() {
      this.batchRunLoading = true
      const maxConcurrentRequests = 5 // 同时运行的最大请求数量
      let activeRequests = 0 // 当前活跃的请求数量
      let index = 0 // 当前处理到的数组索引

      const handleRequest = async (emailObj) => {
        try {
          emailObj.loading = true
          const res = await updateRank({ id: emailObj.id })
          Object.assign(emailObj, res.data)
        } catch (error) {
          this.$message.error(error)
        } finally {
          emailObj.loading = false
          activeRequests-- // 完成一个请求后，活跃请求数量减1
        }
      }

      const loop = async () => {
        while (index < this.selectedEmails.length) {
          if (activeRequests < maxConcurrentRequests) {
            activeRequests++
            handleRequest(this.selectedEmails[index])
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

      this.batchRunLoading = false
      this.getList()
    },
    async removeAccount(row) {
      await this.$confirm("真删?")
      await remove({ ids: [row.id] })
      this.$message.success("删除成功")
      this.getList()
    },
    async batchDelete() {
      console.log(this.selectedEmails)
      await this.$confirm("真批量删?")
      // 调用批量删除方法，传递选中的邮箱数组
      this.removeAccountBatch(this.selectedEmails.map((v) => v.id))
    },
    // 新的批量删除方法，接收一个邮箱id数组
    async removeAccountBatch(ids) {
      if (ids.length === 0) {
        this.$message.warning("请选择要删除的邮箱")
        return
      }
      await remove({ ids })
      this.$message.success("删除成功")
      this.getList()
      this.selectedEmails = [] // 清空选中的邮箱数组
    },
    handleSelectionChange(selection) {
      // selection 是选中的行信息数组
      this.selectedEmails = selection // 假设 id 是邮箱的唯一标识符
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
.score-box {
  display: flex;
  flex-direction: column;
}
::v-deep .el-table .cell {
  font-size: 12px;
}
</style>
