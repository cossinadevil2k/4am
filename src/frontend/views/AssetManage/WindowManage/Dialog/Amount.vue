<template>
  <el-dialog :title="title" :visible.sync="dialogFormVisible" width="400px">
    <el-form :model="form" label-position="right" :label-width="formLabelWidth">
      <el-form-item v-if="type === 'sendToFather'" label="max">
        <el-switch v-model="form.max"></el-switch>
      </el-form-item>
      <el-form-item v-if="!form.max" label="金额">
        <el-input v-model="form.amount" size="mini"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogFormVisible = false" size="small"
        >取 消</el-button
      >
      <el-button type="primary" @click="submit" size="small">确 定</el-button>
    </div>
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      form: {
        amount: "",
        max: false,
      },
      formLabelWidth: "80px",
      dialogFormVisible: false,
      type: ''
    };
  },
  computed:{
    title(){
      if(this.type === 'sendToChild') return '分水设置'
      if(this.type === 'sendToFather') return '归集设置'
    }
  },
  methods: {
    open(id, password, type, name) {
      this.dialogFormVisible = true;
      this.type = type
      this.form = {
        ...this.form,
        id,
        name,
        password,
      };
    },
    submit() {
      this.$emit("submit", this.form, this.type);
      this.dialogFormVisible = false;
    },
  },
};
</script>
<style lang="less" scoped>
::v-deep .el-form-item {
  display: flex;
  align-items: center;
}
::v-deep .el-form-item__content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 0 !important;
}
</style>
