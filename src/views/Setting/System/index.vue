<template>
  <PageCard>
    <el-form
      :model="form"
      ref="numberValidateForm"
      label-width="100px"
      class="form"
    >
      <el-form-item label="Sui密码" prop="age">
        <el-input
          placeholder="请输入密码"
          v-model="form.password"
          show-password
          size="small"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer-right>
      <el-button type="primary" @click="submitForm('numberValidateForm')"
        >提交</el-button
      >
      <el-button @click="resetForm('numberValidateForm')">重置</el-button>
    </template>
  </PageCard>
</template>
<script>
export default {
  data() {
    return {
      form: {
        password: "",
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$store.commit("UPDATE_SETTING", this.form);
          this.$message.success("设置成功");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
};
</script>
<style lang="less" scoped>
.form {
  width: 500px;
}
</style>
