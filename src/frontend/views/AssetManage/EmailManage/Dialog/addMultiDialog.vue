<template>
  <el-dialog title="批量导入" :visible.sync="dialogVisible" width="400px" @close="clearInput">
    <el-input type="textarea" v-model="importText" placeholder="将文本复制并粘贴在此处，使用换行符分割" :autosize="{ minRows: 6, maxRows: 10 }"></el-input>
    <div class="line-count">行数: {{ lineCount }}</div>
    <div class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { batchImport } from "@/api/email"
export default {
  data() {
    return {
      dialogVisible: false,
      importText: "", // 用于存储导入的文本
    }
  },
  computed: {
    lineCount() {
      // 计算导入文本的行数
      const lines = this.importText.split("\n")
      return lines.length
    },
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    clearInput() {
      // 清空文本输入框
      this.importText = ""
    },
    async handleSubmit() {
      // 按换行符分割文本
      const lines = this.importText.split("\n")

      // 过滤掉无效的邮件地址并去除前后空白，然后调用批量新增的方法
      const validEmails = lines.map((line) => line.trim()).filter((line) => this.isValidEmail(line))

      // 假设你有一个用于批量新增的方法 addEmail(emails)
      // 调用批量新增方法
      await this.addEmail(validEmails)
      this.$emit("success")

      // 关闭弹窗并清空输入
      this.dialogVisible = false
      this.clearInput()
    },
    isValidEmail(email) {
      // 定义一个邮件地址的正则表达式模式
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/

      // 使用正则表达式测试邮件地址
      return emailPattern.test(email)
    },
    async addEmail(emails) {
      // 假设你有一个用于批量新增的方法，这里只是简单的示例
      console.log("批量新增邮件地址:", emails)
      const res = await batchImport({ emails })
      this.$notify({
        title: "导入结果",
        message: `
        导入成功: ${res.data.successCount} 条<br>
        导入重复: ${res.data.duplicateCount} 条
        `,
      })
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
