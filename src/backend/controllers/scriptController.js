import { runScript as runScriptService, stopScript as stopScriptService } from "@/services/scriptService"
import * as responseCodes from "@/constants/responseCodes"

// 运行脚本
export async function runScript(req, res) {
  const { name, id, params } = req.body
  try {
    const data = await runScriptService(name, id, params)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, error: error.message })
  }
}
// 停止脚本
export function stopScript(req, res) {
  const { id } = req.body
  if (stopScriptService(id)) {
    res.json({ success: true, message: `Stopped script with ID ${id}` })
  } else {
    res.json({ success: false, message: `No running script found with ID ${id}` })
  }
}
