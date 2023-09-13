<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="removeAll" title="刷新列表">清空数据</el-button>
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
      <el-button type="primary" size="mini" @click="openAccountDialog" title="新增账号">新增</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%">
      <el-table-column prop="seq" label="序号" width="140"> </el-table-column>
      <el-table-column prop="email" label="邮箱" width="140"> </el-table-column>
      <el-table-column prop="name" label="名称" width="140"> </el-table-column>
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <span>{{ row.status === 0 ? "关闭" : "打开" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注"> </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template #default="{ row }">
          <el-button type="text" size="mini" @click="openAccountDialog(row)">编辑</el-button>
          <el-button type="text" size="mini" @click="removeAccount(row)">删除</el-button>
          <el-button type="text" size="mini" @click="getMail">领分</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AddDialog ref="addDialog" @success="getList"></AddDialog>
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
export default {
  components: { AddDialog },
  data() {
    return {
      tableData: [],
      groupList: [],
      serachForm: {},
      pageInfo: {
        currentPage: 1,
        pageSize: 50,
        total: 0,
      },
      loading: false,
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
      const list = await this.$db.OverWalletAcount.find({})
        .sort({ seq: 1 })
        .skip((currentPage - 1) * pageSize)
        .limit(this.pageInfo.pageSize)
        .exec()
        .finally(() => {
          this.loading = false
        })
      this.tableData = list
      console.log(list)
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
      await this.$db.OverWalletAcount.remove({ _id: row._id })
      await this.$db.OverWalletAcount.persistence.compactDatafile()
      await this.updateSeq()
      this.getList()
    },
    async removeAll() {
      await this.$db.OverWalletAcount.removeMany({})
      this.getList()
    },
    async updateSeq() {
      // 查询数据库以获取当前的记录列表，包括序号字段
      const accounts = await this.$db.OverWalletAcount.find({})
      // 根据需要更新序号字段的值
      accounts.forEach((account, index) => {
        // 假设您的序号字段名为 "seq"，并且从 1 开始递增
        account.seq = index + 1
      })

      await this.$db.OverWalletAcount.removeMany({})
      // 将更新后的记录列表重新插入到数据库中
      await this.$db.OverWalletAcount.insert(accounts)
    },
    async getMail() {
      this.$ipc.send("over-wallet")
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
