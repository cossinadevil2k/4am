<template>
  <PageCard>
    <el-row slot="header-right">
      <el-button type="primary" size="mini" @click="getList" title="刷新列表"
        >查询</el-button
      >
    </el-row>
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      height="100%"
    >
      <el-table-column prop="seq" label="序号" width="140"> </el-table-column>
      <el-table-column prop="groupName" label="分组" width="140">
      </el-table-column>
      <el-table-column prop="name" label="名称" width="140"> </el-table-column>
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <span>{{ row.status === 0 ? "关闭" : "打开" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注"> </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template #default="{ row }">
          <el-button type="text" size="mini">分水</el-button>
          <el-button type="text" size="mini" @click="openSendSetting(row)"
            >集水</el-button
          >
          <el-button type="text" size="mini" @click="exportWallet(row)"
            >导出钱包地址</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <Amount ref="amount" @submit="sendToFather"></Amount>
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
import bitApi from "@/api/bitbrowser";
import Amount from "./Dialog/Amount.vue";
export default {
  components: {
    Amount,
  },
  data() {
    return {
      tableData: [],
      pageInfo: {
        currentPage: 1,
        pageSize: 20,
        total: 0,
      },
      loading: false,
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      const params = {
        page: 1,
        pageSize: 20,
        sort: "0",
      };
      this.loading = true;
      bitApi
        .getBrowserList(params)
        .then((res) => {
          this.tableData = res.data.list;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },
    exportWallet(row) {
      if (!this.$store.state.setting.password)
        return this.$message.error("请先设置密码");
      this.$ipc.send(
        "export-wallet",
        row.id,
        this.$store.state.setting.password
      ); // 导出钱包
    },
    openSendSetting(row) {
      if (!this.$store.state.setting.password)
        return this.$message.error("请先设置密码");
      this.$refs.amount.open(row.id, this.$store.state.setting.password);
    },
    sendToFather(row) {
      console.log(row);
      this.$ipc.send(
        "send-to-father",
        row.id,
        row.password,
        row.max ? Infinity : row.amount
      );
    },
  },
};
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
