<template>
  <el-dialog :visible.sync="dialogVisible" title="填写信息" width="500px" @close="clearForm">
    <el-form :model="form" ref="form" :rules="rules" label-width="100px">
      <el-form-item label="地址" prop="address">
        <el-input v-model="form.address" type="text" size="small"></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" size="small"></el-input>
      </el-form-item>
      <el-form-item label="背景色" porp="bgColor">
        <div class="bgColor" :style="{ background: form.bgColor }">
          <el-color-picker v-model="form.bgColor" size="mini" show-alpha></el-color-picker>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, update } from "@/api/suiRankSelf"
export default {
  data() {
    return {
      dialogVisible: false,
      form: {
        address: "",
        remark: "",
        bgColor: "#fff",
      },
      emails: [],
      rules: {
        address: [{ required: false, message: "请输入地址", trigger: "blur" }],
      },
    }
  },
  methods: {
    async open(oldForm) {
      if (oldForm.id) {
        this.form = { ...oldForm }
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

<style lang="less" scoped>
.bgColor {
  width: 200px;
  height: 40px;
}
::v-deep .el-color-picker.el-color-picker--mini {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  .el-color-picker__trigger {
    border: none;
    height: 100%;
  }
}
</style>
