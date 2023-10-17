import * as systemService from "@/services/systemService"
import * as responseCodes from "@/constants/responseCodes"

// 导出数据库
export async function exportDatabase(req, res) {
  try {
    await systemService.exportDb()
    res.json({ code: responseCodes.SUCCESS, message: "success"})
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
// 导出数据库-自选
export async function exportDbWithOption(req, res) {
  try {
    const { names } = req.body
    console.log(names)
    await systemService.exportDbWithOption(names)
    res.json({ code: responseCodes.SUCCESS, message: "success"})
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
// 导入数据库
export async function importDatabase(req, res) {
  try {
    await systemService.importDb()
    res.json({ code: responseCodes.SUCCESS, message: "success"})
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
// 导入数据库
export async function importDbAll(req, res) {
  try {
    await systemService.importDbAll()
    res.json({ code: responseCodes.SUCCESS, message: "success"})
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
