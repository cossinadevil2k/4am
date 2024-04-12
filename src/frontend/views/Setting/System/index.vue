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
      <el-form-item label="socks5Api">
        <el-input v-model="form.socks5Api" placeholder="socks5Api地址（记得添加白名单）" type="text"></el-input>
      </el-form-item>
      <el-form-item label="2CaptchaApi">
        <el-input v-model="form.twoCaptchaApi" placeholder="2CaptchaApi地址（记得保证余额充足）" type="text"></el-input>
      </el-form-item>
      <el-form-item label="版本信息">
        <span>{{ version }}</span>
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
        socks5Api: "",
        twoCaptchaApi: "",
        darkMode: false,
      },
      form: {},
      version: process.env.VUE_APP_VERSION,
    }
  },
  created() {
    console.log(this.$store.state.setting)
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
::v-deep .m-content {
  overflow: auto;
}
</style>
