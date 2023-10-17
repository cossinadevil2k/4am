import { runScript as runScriptService, stopScript as stopScriptService } from "@/services/scriptService"
// 运行脚本
export async function runScript(req, res) {
  const { name, id, params } = req.body
  try {
    const output = await runScriptService(name, id, params)
    res.json({ success: true, output })
  } catch (error) {
    res.json({ success: false, error: error.message })
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
