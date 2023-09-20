<template>
  <el-dialog :visible.sync="dialogVisible" title="填写信息" width="500px" @close="clearForm">
    <el-form :model="form" ref="form" :rules="rules" label-width="100px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" size="small"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" size="small"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" size="small"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, update, count } from "@/api/email"
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        name: "",
        email: "",
        remark: "",
      },
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" },
        ],
        token: [{ required: false, message: "请输入Token", trigger: "blur" }],
      },
    }
  },
  methods: {
    async open(oldForm) {
      if (oldForm.id) {
        this.form = { ...oldForm }
      } else {
        const seq = await this.getNewSeq()
        // 在打开弹窗时接收默认名称和默认序号并填充到表单中
        this.form.name = `账号 ${seq}`
      }
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
    clearForm() {
      const { form } = this.$options.data()
      this.form = form
    },
    async getNewSeq() {
      const res = await count()
      return res.data + 1
    },
    async add(form) {
      const res = await add({ ...form })
      console.log(res)
      this.$emit("success")
    },
    async update(form) {
      console.log(form, 'from')
      await update({ id: form.id, ...form })
      this.$emit("success")
    },
  },
}
</script>

<style scoped></style>
