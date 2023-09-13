// initFolder.mjs
import { promises as fs } from "fs"
import path from "path"
import { app } from "electron"
const basePath = path.join(app.getPath("userData"), "PersistentData")

const paths = {
  // 使用basePath作为基础路径列出您的应用程序可能需要的所有文件夹路径
  gmail: path.join(basePath, "gmail"),
  gmail_token: path.join(basePath, "gmail/token"),
  gmail_credential: path.join(basePath, "gmail/credential"),
  // ... 其他文件夹路径
}

async function ensureDirectoryExists(directory) {
  try {
    await fs.access(directory)
  } catch {
    await fs.mkdir(directory, { recursive: true })
  }
}

async function initFolder() {
  for (const folder of Object.values(paths)) {
    await ensureDirectoryExists(folder)
  }
}

export default initFolder
