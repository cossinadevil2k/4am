import dayjs from 'dayjs'
import * as responseCodes from "@/constants/responseCodes"
import ExportHelper from '@/utils/exportHelper'

export const $page = async ({ db, currentPage = 1, pageSize = 20, query = {}, sort = { created_at: -1 } }) => {
  const list = await db
    .find(query)
    .sort(sort)
    .skip((+currentPage - 1) * +pageSize)
    .limit(+pageSize)
    .exec()
  const total = await db.count()
  return { list, pageInfo: { currentPage, pageSize, total } }
}

// {
//   name: {
//     required: true, // 是否必须
//     unique: true, // 是否唯一
//     format: (val) => {
//       return Number(val);
//     }, // 格式化方法，选填
//   }
// }

export class CURD_SERVICE {
  constructor(model, db) {
    this.model = model || {}
    this.db = db; // 添加数据库实例属性
  }

  async add(data) {
    const insertData = await Object.keys(this.model).reduce(async (pre, key) => {
      const param = this.model[key];
      const value = data[key];
      if (param.required && !value) throw new Error(`${key} is required`);
      if (param.unique) {
        const keyIsExist = await this.db.findOne({ [key]: value });
        if (keyIsExist) throw new Error(`${key} is exist`);
      }
      if (param.format) return { ...(await pre), [key]: param.format(value) };
      return { ...(await pre), [key]: value };
    }, { created_at: new Date().getTime(), updated_at: new Date().getTime() });
    await this.db.insert(insertData);
  }

  async update(id, data) {
    const updateData = await Object.keys(this.model).reduce(async (pre, key) => {
      const param = this.model[key];
      const value = data[key];
      if (param.required && !value) throw new Error(`${key} is required`);
      if (param.unique) {
        const keyIsExist = await this.db.findOne({ [key]: value });
        if (keyIsExist && keyIsExist._id !== id) throw new Error(`${key} is exist`);
      }
      if (param.format) return { ...(await pre), [key]: param.format(value) };
      return { ...(await pre), [key]: value };
    }, { updated_at: new Date().getTime() });
    await this.db.update({ _id: id }, { $set: updateData });
  }

  async detail(id) {
    return await this.db.findOne({ _id: id });
  }

  async remove(ids) {
    await db.wallet.remove({ _id: { $in: ids } }, { multi: true })
  }

  async list({ currentPage = 1, pageSize = 20, query = {} }) {
    const olist = await this.db
      .find(query)
      .sort({ created_at: 1, name: 1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize)
      .exec();
    const list = olist.map((item) => {
      const { _id, created_at, updated_at, ...rest } = item
      return {
        id: _id, // 将 _id 重命名为 id
        created_at: dayjs(created_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
        updated_at: dayjs(updated_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
        ...rest,
      }
    })
    return { list, pageInfo: { currentPage, pageSize, total: await this.db.count(query) } };
  }

  async export() {
    const data = await this.list({ currentPage: 1, pageSize: 9999 })
    if(!data.list.length) throw `数据为空`
    const fields = Object.keys(data.list[0])
    ExportHelper.exportData(data.list, fields, 'excel', '/export.xlsx')
  }
}


export class CURD_CONTROLLER {
  constructor(service) {
    this.service = service
  }
  add = async (req, res) => {
    try {
      const data = await this.service.add(req.body)
      res.json({ code: responseCodes.SUCCESS, message: "success", data })
    } catch (error) {
      res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
    }
  }
  update = async (req, res) => {
    const { id, ...rest } = req.body
    try {
      await this.service.update(id, rest)
      res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
    } catch (error) {
      res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
    }
  }
  detail = async (req, res) => {
    const id = req.params.id
    const data = await this.service.detail(id)
    if (!data) {
      return res.status(responseCodes.NOT_FOUND).json({ code: responseCodes.NOT_FOUND, message: "not found", data: null })
    }
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  }
  remove = async (req, res) => {
    const { ids } = req.body
    if (!ids || ids.length === 0) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "ids is required", data: null })
    }
    await this.service.remove(ids)
    res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
  }
  list = async (req, res) => {
    try {
      console.log(req.query)
      const { currentPage, pageSize } = req.query || {}
      const list = await this.service.list({ currentPage, pageSize })
      res.json({ code: responseCodes.SUCCESS, message: "success", data: list })
    } catch (error) {
      res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
    }
  }
  export = async (req, res) => {
    try {
      await this.service.export()
      res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
    } catch (error) {
      res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
    }
  }
}