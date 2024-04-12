<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
      <el-button type="primary" size="mini" @click="open('add')" title="刷新列表">新建钱包分组</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="name" label="名称" min-width="140">
        <template #default="{ row }">
            <el-button type="text" @click="$router.push({ name: 'AssetManage_WalletManage_WalletDetail', query: { dbid: row.dbid, name: row.name } })">{{ row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="walletNum" label="数量" min-width="100"></el-table-column>
      <el-table-column prop="remark" label="备注" min-width="140"></el-table-column>
      <el-table-column prop="operate" label="操作">
        <template #default="{ row }">
          <el-button :loading="row.loading" type="text" size="mini" @click="$router.push({ name: 'AssetManage_WalletManage_WalletDetail', query: { dbid: row.dbid, name: row.name} })">详 情</el-button>
          <el-button :loading="row.loading" type="text" size="mini">编 辑</el-button>
          <!-- <el-button :loading="row.loading" type="text" size="mini" @click="remove(row)">删 除</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <template slot="footer-left">
      <!-- <el-button type="primary" :disabled="!selected.length" size="small" @click="batchRemove">批量删除</el-button> -->
    </template>
    <el-pagination
      slot="footer-right"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageInfo.currentPage"
      :page-sizes="[20, 50, 100, 200]"
      :page-size="pageInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageInfo.total"
    >
    </el-pagination>
    <Add ref="add" @success="getList"/>
  </PageCard>
</template>
<script>
import { mapState } from "vuex"
import { list, remove, faucet, getBalance } from "@/api/wallet"
import Add from "./Dialog/add.vue"
export default {
  components: { Add },
  data() {
    return {
      tableData: [],
      groupList: [],
      serachForm: {},
      pageInfo: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      selected: [],
      loading: false,
    }
  },
  computed: {
    ...mapState(["setting"]),
  },
  async mounted() {
    this.getList()
  },
  methods: {
    handleSelectionChange(selection) {
      // selection 是选中的行信息数组
      this.selected = selection // 假设 id 是邮箱的唯一标识符
    },
    async getBalance(row){
      await getBalance({ dbid: row.dbid })
    },
    getList() {
      const { currentPage, pageSize } = this.pageInfo
      this.loading = true
      list({ currentPage, pageSize, sort: { name: 1 } })
        .then((res) => {
          this.tableData = res.data.list.map(v => ({ ...v, loading: false}))
          this.pageInfo.total = res.data.pageInfo.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    open(ref, rest) {
      this.$refs[ref].open(rest)
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
    async remove(row) {
      await this.$confirm("真删?")
      await remove({ ids: [row.id] })
      this.$message.success("删除成功")
      this.getList()
    },
    async batchRemove() {
      console.log(this.selectedEmails)
      await this.$confirm("真批量删?")
      // 调用批量删除方法，传递选中的邮箱数组
      this.removeBatch(this.selectedEmails.map((v) => v.id))
    },
    // 新的批量删除方法，接收一个邮箱id数组
    async removeBatch(ids) {
      if (ids.length === 0) {
        this.$message.warning("请选择要删除的邮箱")
        return
      }
      await remove({ ids })
      this.$message.success("删除成功")
      this.getList()
      this.selectedEmails = [] // 清空选中的邮箱数组
    },
    async getLiquid(row){
      row.loading = true
      await faucet({ dbid: row.dbid }).finally(() => {
        row.loading = false
      })
    }
  },
}
</script>
<style lang="less" scoped>
// .container {
//   width: 100%;

//   .m-header,
//   .m-footer {
//     background: #fff;
//     padding: 0 20px;
//     height: 60px;
//     display: flex;
//     align-items: center;
//     // ::v-deep .el-pagination{
//     //     justify-self: flex-end;
//     // }
//   }
//   .m-header {
//     margin-bottom: 10px;
//   }
//   .m-footer {
//     height: 50px;
//     margin-top: 10px;
//     display: flex;
//     justify-content: space-between;
//   }
// }
</style>
