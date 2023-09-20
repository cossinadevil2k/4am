<template>
  <PageCard>
    <el-form :model="form" ref="numberValidateForm" label-width="100px" class="form">
      <el-form-item label="邀请码" prop="invite_code">
        <el-input placeholder="请输入邀请码" v-model="form.invite_code" size="small"></el-input>
      </el-form-item>
    </el-form>
    <template #footer-right>
      <el-button type="primary" @click="submitForm('numberValidateForm')">提交</el-button>
      <el-button @click="resetForm('numberValidateForm')">重置</el-button>
    </template>
  </PageCard>
</template>
<script>
import { getSetting, updateSetting } from "@/api/over"
export default {
  data() {
    return {
      form: {},
    }
  },
  created() {
    this.getSetting()
  },
  methods: {
    async getSetting() {
      const res = await getSetting()
      this.form = res.data
    },
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          await updateSetting(this.form)
          this.$message.success("设置成功")
        } else {
          console.log("error submit!!")
          return false
        }
      })
    },
    resetForm() {
      this.getSetting()
    },
  },
}
</script>
<style lang="less" scoped>
.form {
  width: 500px;
}
</style>
