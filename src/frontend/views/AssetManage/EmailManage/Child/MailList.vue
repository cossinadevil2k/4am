<template>
  <PageCard :title="`${$route.meta.title} ${$route.query.email}`" goBack>
    <el-row slot="header-right">
      <el-button type="primary" :loading="loading" size="small" @click="getEmail">获取邮件</el-button>
    </el-row>
    <el-table v-loading="loading" :data="tableData" style="width: 100%" height="100%">
      <el-table-column prop="from" label="发件人" min-width="120"></el-table-column>
      <el-table-column prop="to" label="收件人" min-width="120"></el-table-column>
      <el-table-column prop="date" label="时间" min-width="90"></el-table-column>
      <el-table-column prop="subject" label="主题" min-width="140"></el-table-column>
      <el-table-column prop="snippet" label="摘要" min-width="240"></el-table-column>
    </el-table>
  </PageCard>
</template>
<script>
import { mails } from "@/api/email"
import dayjs from 'dayjs'
export default {
  data() {
    return {
      tableData: [],
      loading: false,
    }
  },
  activated() {
    console.log(this.$route.query)
  },
  methods: {
    async getEmail() {
      this.loading = true
      const res = await mails(this.$route.query.id).finally(() => {
        this.loading = false
      })
      this.tableData = res.data.map(v => ({...v, date: dayjs(new Date(v.date)).format('YYYY-MM-DD HH:mm:ss')}))
    },
  },
}
</script>
