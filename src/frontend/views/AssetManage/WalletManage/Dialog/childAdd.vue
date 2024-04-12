<template>
  <el-dialog :visible.sync="dialogVisible" title="填写信息" width="500px" @close="clearForm">
    <el-form :model="form" ref="form" :rules="rules" label-width="100px">
      <el-form-item label="数量" prop="num">
        <el-input v-model="form.num" type="number" size="small"></el-input>
      </el-form-item>
      <el-form-item label="dbid" prop="dbid">
        <el-input v-model="form.dbid" disabled size="small"></el-input>
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
import { createWallet } from "@/api/wallet"
import { v4 as uuid } from "uuid"

export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        num: "",
        dbid: "",
        remark: "",
      },
      rules: {
        num: [{ required: true, message: "请输入数量", trigger: "blur" }],
      },
    }
  },
  methods: {
    async open(dbid) {
      this.form.dbid = dbid
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true
          await createWallet(this.form).finally(() => {
            this.loading = false
          })
          this.dialogVisible = false // 关闭弹窗
          this.$emit("success")
        } else {
          this.$message.error("表单验证失败，请检查输入")
        }
      })
    },
    clearForm() {
      const { form } = this.$options.data()
      this.form = form
    },
  },
}
</script>

<style scoped></style>
