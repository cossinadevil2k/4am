<template>
  <el-dialog :visible.sync="dialogVisible" title="填写信息" width="500px" @close="clearForm">
    <el-form :model="form" ref="form" :rules="rules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" size="small"></el-input>
      </el-form-item>
      <el-form-item label="cookie" prop="cookie">
        <el-input v-model="form.cookie" size="small"></el-input>
      </el-form-item>
      <el-form-item label="twid" prop="twid">
        <el-input v-model="form.twid" size="small"></el-input>
      </el-form-item>
      <el-form-item label="代理主机" prop="proxy_host">
        <el-input v-model="form.proxy_host" size="small"></el-input>
      </el-form-item>
      <el-form-item label="代理端口" prop="proxy_port">
        <el-input v-model="form.proxy_port" size="small"></el-input>
      </el-form-item>
      <el-form-item label="代理账号" prop="proxy_username">
        <el-input v-model="form.proxy_username" size="small"></el-input>
      </el-form-item>
      <el-form-item label="代理密码" prop="proxy_password">
        <el-input v-model="form.proxy_password" size="small"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" size="small"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import {  add, update } from "@/api/metaCene"
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        name: "",
        cookie: "",
        remark: "",
      },
      emails: [],
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        cookie: [{ required: true, message: "请输入cookie", trigger: "blur" }],
        token: [{ required: false, message: "请输入Token", trigger: "blur" }],
      },
    }
  },
  methods: {
    async open(oldForm) {
      if (oldForm.id) {
        this.form = { ...oldForm }
      }
      console.log(oldForm)
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          // 表单验证通过，触发 submit 事件并传递表单数据
          const api = this.form.id ? this.update : this.add
          await api(this.form)
          this.dialogVisible = false // 关闭弹窗
        } else {
          this.$message.error("表单验证失败，请检查输入")
        }
      })
    },
    handleChange(address) {
      const email = this.emails.find((item) => item.email === address)
      this.form.name = email.name
    },
    clearForm() {
      const { form } = this.$options.data()
      this.form = form
    },
    async add(form) {
      const res = await add({ ...form })
      console.log(res)
      this.$emit("success")
    },
    async update(form) {
      console.log(form, "from")
      await update({ id: form.id, ...form })
      this.$emit("success")
    },
  },
}
</script>

<style scoped></style>
