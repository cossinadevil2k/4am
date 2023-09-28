import { exportDb, importDb } from "@/services/systemService"
import * as responseCodes from "@/constants/responseCodes"

// 导出数据库
export async function exportDatabase(req, res) {
  try {
    await exportDb()
    res.json({ code: responseCodes.SUCCESS, message: "success"})
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
// 导入数据库
export async function importDatabase(req, res) {
  try {
    await importDb()
    res.json({ code: responseCodes.SUCCESS, message: "success"})
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
