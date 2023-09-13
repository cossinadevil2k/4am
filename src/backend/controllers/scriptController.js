// 运行脚本
export async function runScript(req, res) {
  const { scriptName } = req.params
  try {
    const { output, id } = await runScript(scriptName)
    res.json({ success: true, output, id })
  } catch (error) {
    res.json({ success: false, error: error.message })
  }
}
// 停止脚本
export function stopScript(req, res) {
  const { id } = req.params
  if (stopScript(id)) {
    res.json({ success: true, message: `Stopped script with ID ${id}` })
  } else {
    res.json({ success: false, message: `No running script found with ID ${id}` })
  }
}
