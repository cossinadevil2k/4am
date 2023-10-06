<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
      <el-button type="primary" size="mini" @click="openAccountDialog" title="新增账号">新增</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="240"> </el-table-column>
      <el-table-column prop="name" label="名称" min-width="100"> </el-table-column>
      <el-table-column prop="over_name" label="over名称" min-width="140"> </el-table-column>
      <!-- <el-table-column prop="my_invite_code" label="邀请码" min-width="120"> </el-table-column> -->
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">
          <span :style="{ color: OVER_STATUS_TEXT[row.status] == '已领完' ? '#67C23A' : '#E6A23C' }">{{ OVER_STATUS_TEXT[row.status] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="point" label="分数/上次分数" min-width="140">
        <template #default="{ row }">
          <span>{{ row.point }}/</span>
          <span style="color: #ccc">{{ `${row.previous_point}` }}</span>
          <span style="color: red">{{ `(${row.point - row.previous_point})` }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="rank" label="排名" min-width="140">
        <template #default="{ row }">
          <span :title="`${row.rank}/${row.user_count}/${((row.rank / row.user_count) * 100).toFixed(3)}%`">{{
            `${parseInt(row.rank / 10000)}万/${parseInt(row.user_count / 10000)}万/${parseInt((row.rank / row.user_count) * 100)}%`
          }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="last_claim_at" label="领分时间" min-width="120"> </el-table-column>
      <el-table-column prop="last_quiz_at" label="答题时间" min-width="120"> </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160"> </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="140"></el-table-column>
      <el-table-column prop="operate" label="操作" min-width="180">
        <template #default="{ row }">
          <el-button :loading="row.loading" type="text" size="mini" @click="getDailyReward(row)">运行</el-button>
          <!-- <el-button type="text" size="mini" @click="getDailyQuiz(row)">获取问题和答案</el-button> -->
          <el-button type="text" size="mini" @click="openAccountDialog(row)">编辑</el-button>
          <el-button type="text" size="mini" @click="removeAccount(row)">删除</el-button>
          <el-button type="text" size="mini" @click="$message.info(row.my_invite_code)">邀请码</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AddDialog ref="addDialog" @success="getList"></AddDialog>
    <template slot="footer-left">
      <el-button type="primary" :loading="batchRunLoading" @click="batchRun" :disabled="!selectedEmails.length" size="small">批量运行</el-button>
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
import { list, remove, dailyReward, dailyQuiz } from "@/api/over"
import { OVER_STATUS_CONST, OVER_STATUS_TEXT } from "SHARE/over"
export default {
  components: { AddDialog },
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
      OVER_STATUS_CONST,
      OVER_STATUS_TEXT,
    }
  },
  computed: {
    ...mapState(["setting"]),
  },
  mounted() {
    this.getList()
  },
  methods: {
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
    async getToken(row) {
      const res = await token(row.email)
      this.getList()
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
    async batchDelete() {
      console.log(this.selectedEmails)
      await this.$confirm("真批量删?")
      // 调用批量删除方法，传递选中的邮箱数组
      this.removeAccountBatch(this.selectedEmails.map((v) => v.id))
    },
    async batchRun() {
      this.$prompt("请输入答案关键词", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(async ({ value: answer }) => {
        this.batchRunLoading = true

        const maxConcurrentRequests = 5 // 同时运行的最大请求数量
        let activeRequests = 0 // 当前活跃的请求数量
        let index = 0 // 当前处理到的数组索引

        const handleRequest = async (emailObj) => {
          try {
            emailObj.loading = true
            const res = await dailyReward(emailObj.email, answer)
            this.$message.info(`
          领分${res.data.claim_success ? "成功(" + res.data.claim_reward + ")" : "失败"}
          答题${res.data.quiz_success ? "成功(" + res.data.quiz_reward + ")" : "失败"}
        `)
            Object.assign(emailObj, res.data.account)
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
      })
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
    async getDailyReward(row) {
      console.log("getDailyReward", row)
      this.$prompt("请输入答案关键词", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(async ({ value: answer }) => {
        row.loading = true
        const res = await dailyReward(row.email, answer).finally(() => {
          row.loading = false
        })
        this.$message.info(`
            领分${res.data.claim_success ? "成功(" + res.data.claim_reward + ")" : "失败"}
            答题${res.data.quiz_success ? "成功(" + res.data.quiz_reward + ")" : "失败"}
          `)
        this.getList()
      })
    },
    async getDailyQuiz(row) {
      console.log("getDailyQuiz", row)
      await dailyQuiz(row.email)
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
