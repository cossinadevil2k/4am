<template>
  <PageCard>
    <el-form :model="form" ref="numberValidateForm" label-width="100px" class="form">
      <el-form-item label="Sui密码" prop="age">
        <el-input placeholder="请输入密码" v-model="form.password" show-password size="small"></el-input>
      </el-form-item>
      <el-form-item label="黑夜模式" prop="darkMode">
        <el-switch v-model="form.darkMode"> </el-switch>
      </el-form-item>
      <el-form-item label="导出数据库">
        <el-button type="text" @click="backupDb">点击导出</el-button>
      </el-form-item>
      <el-form-item label="导入数据库">
        <el-button type="text" @click="importDb">点击导入</el-button>
      </el-form-item>
      <el-form-item label="版本信息">
        <span>{{ version }}</span>
      </el-form-item>
      <el-divider content-position="left">noss设置</el-divider>
      <el-form-item label="代理" prop="proxy">
        <el-input placeholder="username:password@your-socks5-proxy-server:port" type="text" v-model="form.proxy" size="small"></el-input>
      </el-form-item>
      <el-form-item label="登录时间" prop="loginTime">
        <el-input placeholder="请输入" type="text" v-model="form.loginTime" size="small"></el-input>
      </el-form-item>
      <el-form-item label="mint时间" prop="mintTime">
        <el-input placeholder="请输入" type="text" v-model="form.mintTime" size="small"></el-input>
      </el-form-item>
      <el-form-item label="休息时间" prop="sleepTime">
        <el-input placeholder="请输入" type="text" v-model="form.sleepTime" size="small"></el-input>
      </el-form-item>
      <el-form-item label="线程" prop="threads">
        <el-input placeholder="请输入" type="text" v-model="form.threads" size="small"></el-input>
      </el-form-item>
      <el-form-item label="chrome路径" prop="pathChrome">
        <el-input placeholder="请输入" type="text" v-model="form.pathChrome" size="small"></el-input>
      </el-form-item>
      <el-form-item label="userData路径" prop="pathUserData">
        <el-input placeholder="请输入" type="text" v-model="form.pathUserData" size="small"></el-input>
      </el-form-item>
      <el-form-item label="插件路径" prop="pathExtensions">
        <el-input placeholder="请输入" type="text" v-model="form.pathExtensions" size="small"></el-input>
      </el-form-item>
      <el-divider content-position="left">noss监控</el-divider>
      <el-form-item label="监控间隔" prop="age">
        <el-input placeholder="请输入" type="text" v-model="form.monitorTime" size="small"></el-input>
      </el-form-item>
      <el-form-item label="监控地址1" prop="age">
        <el-input placeholder="请输入" type="text" v-model="form.nossAddr1" size="small"></el-input>
      </el-form-item>
      <el-form-item label="监控地址2" prop="age">
        <el-input placeholder="请输入" type="text" v-model="form.nossAddr2" size="small"></el-input>
      </el-form-item>
      <el-form-item label="监控地址3" prop="age">
        <el-input placeholder="请输入" type="text" v-model="form.nossAddr3" size="small"></el-input>
      </el-form-item>
      <el-form-item label="监控地址4" prop="age">
        <el-input placeholder="请输入" type="text" v-model="form.nossAddr4" size="small"></el-input>
      </el-form-item>
      <el-form-item label="监控地址5" prop="age">
        <el-input placeholder="请输入" type="text" v-model="form.nossAddr5" size="small"></el-input>
      </el-form-item>
    </el-form>
    <template #footer-right>
      <el-button type="primary" @click="submitForm('numberValidateForm')">提交</el-button>
      <el-button @click="resetForm('numberValidateForm')">重置</el-button>
    </template>
  </PageCard>
</template>
<script>
import { exportDatabase, importDatabase } from "@/api/system"

export default {
  data() {
    return {
      defaultForm: {
        password: "",
        darkMode: false,
        loginTime: 30 * 1000,
        mintTime: 5 * 60 * 1000,
        sleepTime: 3 * 60 * 1000,
        threads: "12",
        pathChrome: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        pathUserData: "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data",
        pathExtensions: "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\iokeahhehimjnekafflcihljlcjccdbe\\3.6.0_0",
        proxy: "",
        monitorTime: 20 * 60 * 1000,
        nossAddr1: "",
        nossAddr2: "",
        nossAddr3: "",
        nossAddr4: "",
        nossAddr5: "",
      },
      form: {},
      version: process.env.VUE_APP_VERSION,
    }
  },
  created() {
    this.form = Object.assign({ ...this.defaultForm }, this.$store.state.setting)
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$store.commit("UPDATE_SETTING", this.form)
          this.$message.success("设置成功")
        } else {
          console.log("error submit!!")
          return false
        }
      })
    },
    resetForm(formName) {
      this.form = { ...this.defaultForm }
      console.log(this.form)
    },
    backupDb() {
      exportDatabase()
    },
    async importDb() {
      await this.$confirm("导入会覆盖原有数据,谨慎操作")
      importDatabase()
    },
    checkUpdate() {
      window.app.checkUpdate()
    },
  },
}
</script>
<style lang="less" scoped>
.form {
  width: 500px;
  ::v-deep .el-form-item__content {
    text-align: left;
  }
}
::v-deep .m-content{
  overflow: auto;
}
</style>
