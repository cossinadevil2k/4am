<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="seq" label="序号" width="140"> </el-table-column>
      <el-table-column prop="groupName" label="分组" width="140"> </el-table-column>
      <el-table-column prop="name" label="名称" width="140"> </el-table-column>
      <el-table-column prop="remark" label="备注"> </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template #default="{  }">
          <el-button type="text" size="mini" >操作</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template slot="footer-left">
      <el-button type="primary" :disabled="!selected.length"  size="small">批量按钮</el-button>
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
  </PageCard>
</template>
<script>
import { mapState } from "vuex"
import { list } from "@/api/metaCene"

export default {
  components: {},
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
    getList() {
      const { currentPage, pageSize } = this.pageInfo
      this.loading = true
      list({ currentPage, pageSize, sort: { name: 1 } })
        .then((res) => {
          this.tableData = res.data.list
          this.pageInfo.total = res.data.pageInfo.total
        })
        .finally(() => {
          this.loading = false
        })
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
</style>
