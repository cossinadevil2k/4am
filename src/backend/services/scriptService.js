// src/backend/controllers/scriptController.js
import path from "path"
import fs from "fs/promises"
import { spawn } from "child_process"
import { v4 as uuidv4 } from "uuid"

const runningScripts = {}

export const runScript = async (scriptName) => {
  const scriptPath = path.join(__dirname, "..", "scripts", scriptName, "index.js")
  try {
    await fs.access(scriptPath)
  } catch (error) {
    throw new Error("Script not found")
  }

  const child = spawn("node", [scriptPath])
  const id = uuidv4()
  runningScripts[id] = child

  let output = ""

  child.stdout.on("data", (data) => {
    output += data.toString()
  })

  child.stderr.on("data", (data) => {
    output += `Error: ${data}`
  })

  child.on("exit", () => {
    delete runningScripts[id]
  })

  return new Promise((resolve, reject) => {
    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ output, id })
      } else {
        reject(new Error(`Script exited with code ${code}: ${output}`))
      }
    })
  })
}

export const stopScript = (id) => {
  const child = runningScripts[id]
  if (child) {
    child.kill()
    return true
  }
  return false
}
