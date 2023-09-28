import scripts from "@/scripts"
const runningScripts = {}

export const runScript = async (scriptName, id) => {
  console.log(scriptName, !!runningScripts[id])
  if (runningScripts[id]) {
    throw new Error("Script already running")
  }
  const script = scripts[scriptName]
  if (!script) {
    throw new Error("Script not found")
  }
  runningScripts[id] = script
  try {
    await script.run()
    return { status: "completed", id }
  } catch (error) {
    if (error.message === "Script was stopped") {
      return { status: "stopped", id }
    }
    throw error
  }
}

export const stopScript = (id) => {
  const stoppableScript = runningScripts[id]
  if (stoppableScript) {
    stoppableScript.stop()
    delete runningScripts[id]
    return true
  }
  return false
}
