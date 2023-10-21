<template>
  <el-dialog title="批量导入" :visible.sync="dialogVisible" width="500px" @close="clearInput">
    <el-form :model="form" ref="form" label-width="100px">
      <el-form-item label="地址" prop="address">
        <el-input type="textarea" v-model="form.address" placeholder="将文本复制并粘贴在此处，使用换行符分割" :autosize="{ minRows: 6, maxRows: 10 }"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" size="small"></el-input>
      </el-form-item>
    </el-form>
    <div class="line-count">行数: {{ lineCount }}</div>
    <div class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { batchImport } from "@/api/suiRankSelf"
export default {
  data() {
    return {
      form: {
        address: "",
        remark: "",
      },
      dialogVisible: false,
    }
  },
  computed: {
    lineCount() {
      // 计算导入文本的行数
      const lines = this.form.address.split("\n")
      return lines.length
    },
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    clearInput() {
      // 清空文本输入框
      this.form.address = ""
    },
    async handleSubmit() {
      // 按换行符分割文本
      const lines = this.form.address.split("\n")

      // 过滤掉无效的邮件地址并去除前后空白，然后调用批量新增的方法
      const validEmails = lines.map((line) => line.trim()).filter((line) => line)

      // 假设你有一个用于批量新增的方法 addEmail(emails)
      // 调用批量新增方法
      await this.addAddress(validEmails)
      this.$emit("success")

      // 关闭弹窗并清空输入
      this.dialogVisible = false
      this.clearInput()
    },
    async addAddress(address) {
      // 假设你有一个用于批量新增的方法，这里只是简单的示例
      console.log("批量新增地址:", address)
      await batchImport({ address, remark: this.form.remark })
    },
  },
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
  margin-top: 10px;
}

.line-count {
  text-align: right;
  margin-top: 5px;
  color: #999;
}
</style>
