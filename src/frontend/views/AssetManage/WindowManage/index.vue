<template>
  <PageCard>
    <el-row slot="header-right">
      <el-select style="margin-right: 10px" v-model="serachForm.groupId" placeholder="请选择" size="small">
        <el-option v-for="item in groupList" :key="item.id" :label="item.groupName" :value="item.id"> </el-option>
      </el-select>
      <el-button type="primary" size="mini" @click="noss" title="noss">nossMint</el-button>
      <el-button type="primary" size="mini" @click="nossMonitor" title="noss">noss监控</el-button>
      <el-button type="primary" size="mini" @click="getList" title="刷新列表">查询</el-button>
      <!-- <el-button type="primary" size="mini" @click="stop" title="刷新列表">停止</el-button> -->
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="seq" label="序号" width="140"> </el-table-column>
      <el-table-column prop="groupName" label="分组" width="140"> </el-table-column>
      <el-table-column prop="name" label="名称" width="140"> </el-table-column>
      <el-table-column prop="status" label="状态" width="140">
        <template #default="{ row }">
          <span>{{ row.status === 0 ? "关闭" : "打开" }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注"> </el-table-column>
      <el-table-column prop="operate" label="操作">
        <template #default="{ row }">
          <el-button type="text" size="mini" @click="openSendSetting(row, 'sendToChild')">分水</el-button>
          <el-button type="text" size="mini" @click="openSendSetting(row, 'sendToFather')">集水</el-button>
          <!-- <el-button type="text" size="mini" @click="exportWallet(row)">导出钱包地址</el-button> -->
          <el-button type="text" size="mini" @click="sui2(row)">Sui3期取货</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Amount ref="amount" @submit="sendToFather"></Amount>
    <template slot="footer-left">
      <el-button type="primary" :disabled="!selected.length" :loading="exportLoading" @click="exportWallet" size="small">批量导出钱包</el-button>
      <el-button type="primary" :disabled="!selected.length" :loading="creatLoading" @click="sui3Create" size="small">批量创建钱包</el-button>
      <el-button type="primary" :disabled="!selected.length" :loading="inviteLoading" @click="sui3Invite" size="small">批量邀请</el-button>
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
import bitApi from "@/api/bitbrowser"
import Amount from "./Dialog/Amount.vue"
import { mapState } from "vuex"
import { runScript, stopScript } from "@/api/script"
import { v4 as uuid } from "uuid"
export default {
  components: {
    Amount,
  },
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
      id: uuid(),
      creatLoading: false,
      inviteLoading: false,
      exportLoading: false,
    }
  },
  computed: {
    ...mapState(["setting"]),
  },
  async mounted() {
    this.getList()
    this.getGroup()
  },
  methods: {
    handleSelectionChange(selection) {
      // selection 是选中的行信息数组
      this.selected = selection // 假设 id 是邮箱的唯一标识符
    },
    stop() {
      stopScript(this.id)
    },
    start(name) {
      runScript(name, { id: this.id })
    },
    getList() {
      const params = {
        page: this.pageInfo.currentPage - 1,
        pageSize: this.pageInfo.pageSize,
        groupId: this.serachForm.groupId,
      }
      this.loading = true
      bitApi
        .getBrowserList(params)
        .then((res) => {
          this.tableData = res.data.list
          this.pageInfo.total = res.data.totalNum
        })
        .finally(() => {
          this.loading = false
        })
    },
    getGroup() {
      const params = {
        page: 0,
        pageSize: 50,
        all: true,
      }
      bitApi.getGroupList(params).then((res) => {
        this.groupList = res.data.list
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
    sui3Invite() {
      if (!this.setting.password) return this.$message.error("请先设置密码")
      this.$prompt("请输入邀请链接", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(async ({ value }) => {
        if (!value) return this.$message.error("邀请链接不能为空")
        await bitApi.updateBrowserMemark(
          value,
          this.selected.map((v) => v.id)
        )
        // this.inviteLoading = true
        runScript({
          name: "sui3Invite",
          id: uuid(),
          params: {
            windows: this.selected.map((v) => ({ id: v.id, name: v.name })),
            link: value,
            password: this.setting.password,
          },
        }).finally(() => {
          // this.inviteLoading = false
        })
      })
    },
    noss() {
      runScript({
        name: "noss",
        id: uuid(),
        params: {
          setting: this.setting
        }
      })
    },
    nossMonitor() {
      runScript({
        name: "nossMonitor",
        id: uuid(),
        params: {
          setting: this.setting
        }
      })
    },
    exportWallet() {
      if (!this.setting.password) return this.$message.error("请先设置密码")
      this.exportLoading = true
      runScript({
        name: "exportWallet",
        id: uuid(),
        params: {
          windows: this.selected.map((v) => ({ id: v.id, name: v.name })),
          password: this.setting.password,
        },
      }).finally(() => {
        this.exportLoading = false
      })
    },
    sui3Create() {
      if (!this.setting.password) return this.$message.error("请先设置密码")
      this.creatLoading = true
      runScript({
        name: "sui3CreateAccount",
        id: uuid(),
        params: {
          windows: this.selected.map((v) => ({ id: v.id, name: v.name })),
          password: this.setting.password,
        },
      }).finally(() => {
        this.creatLoading = false
      })
    },
    openSendSetting(row, type = "sendToChild") {
      if (!this.setting.password) return this.$message.error("请先设置密码")
      this.$refs.amount.open(row.id, this.setting.password, type, row.name)
    },
    sendToFather(row, name) {
      const id = uuid()
      console.log(row, "row")
      runScript({
        name,
        id,
        params: {
          id: row.id,
          name: row.name,
          password: row.password,
          max: row.max,
          amount: row.amount,
        },
      })
    },
    sui2(row) {
      if (!this.setting.password) return this.$message.error("请先设置密码")
      runScript({
        name: "sui3",
        id: uuid(),
        params: {
          config: row,
          password: this.setting.password,
        },
      })
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
