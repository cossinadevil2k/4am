<template>
  <el-dialog :visible.sync="dialogVisible" title="填写信息" width="500px" @close="clearForm">
    <el-form :model="form" ref="form" label-width="100px">
      <el-form-item label="0后第几位" prop="number">
        <el-input v-model="form.number" type="text" size="small"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        number: "",
      },
    }
  },
  methods: {
    async open() {
      this.dialogVisible = true
    },
    submit() {
      this.$emit("success", this.form)
      this.dialogVisible = false
    },
    clearForm() {
      const { form } = this.$options.data()
      this.form = form
    },
  },
}
</script>

<style scoped></style>
