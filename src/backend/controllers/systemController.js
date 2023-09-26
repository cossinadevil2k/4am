import { exportDb } from "@/services/systemService"
// 运行脚本
export async function exportDatabase(req, res) {
  try {
    const result = await exportDb()
    res.json(result)
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
}
