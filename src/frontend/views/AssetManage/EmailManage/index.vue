<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="openApikeyDir">打开apikey文件夹</el-button>
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
      <el-button type="primary" size="mini" @click="openAccountDialog" title="新增账号">新增</el-button>
      <el-button type="primary" size="mini" @click="() => $refs.addMultiDialog.open()" title="批量新增">批量新增</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="email" label="邮箱" min-width="240"> </el-table-column>
      <el-table-column prop="name" label="名称" min-width="140"> </el-table-column>
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="{ row }">
          <span>{{ EMAIL_STATUS_TEXT[row.status] }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="proxy" label="代理" min-width="180">
        <template #default="{ row }">
          <span v-if="row.proxy_host">{{ `${row.proxy_host}:${row.proxy_port}` }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160"> </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="140"></el-table-column>
      <el-table-column prop="operate" label="操作" min-width="180">
        <template #default="{ row }">
          <el-button v-if="EMAIL_STATUS_CONST.CREATED === row.status" type="text" size="mini" @click="check(row)">检测apikey</el-button>
          <el-button v-if="EMAIL_STATUS_CONST.CREDENTIALS === row.status" type="text" size="mini" @click="getToken(row)">获取token</el-button>
          <el-button v-if="EMAIL_STATUS_CONST.TOKEN === row.status" type="text" size="mini" @click="$router.push({ name: 'AssetManage_EmailManage_MailList', query: { email: row.email, id: row.id } })"
            >管理邮件</el-button
          >
          <el-button type="text" size="mini" @click="openAccountDialog(row)">编辑</el-button>
          <el-button type="text" size="mini" @click="removeAccount(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AddDialog ref="addDialog" @success="getList"></AddDialog>
    <AddMultiDialog ref="addMultiDialog" @success="getList"></AddMultiDialog>
    <el-button slot="footer-left" type="primary" @click="batchDelete" :disabled="!selectedEmails.length" size="small">批量删除</el-button>
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
import { list, remove, token, check, openApikeyDir } from "@/api/email"
import { EMAIL_STATUS_TEXT, EMAIL_STATUS_CONST } from "SHARE/email"
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
      EMAIL_STATUS_TEXT,
      EMAIL_STATUS_CONST,
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
      this.tableData = res.data.list
      console.log(this.pageInfo, res)
      this.pageInfo.total = res.data.pageInfo.total
    },
    async openApikeyDir(){
      const res = await openApikeyDir()

    },
    async check(row) {
      const res = await check(row.id)
      this.getList()
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
      this.selectedEmails = selection.map((row) => row.id) // 假设 id 是邮箱的唯一标识符
    },
    async batchDelete() {
      console.log(this.selectedEmails)
      await this.$confirm("真批量删?")
      // 调用批量删除方法，传递选中的邮箱数组
      this.removeAccountBatch(this.selectedEmails)
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
