import { dialog } from "electron"
import db from "@/db"
import fs from 'fs'
import dayjs from "dayjs"
export const exportDb = async () => {
  try {
    const allData = await db.over.find({})
    const defaultFileName = `4am-db-${dayjs().format('YYMMDDHHmmss')}.json`;
    const options = {
      title: "Save Database Backup",
      defaultPath: defaultFileName,
      filters: [{ name: "JSON", extensions: ["json"] }],
    }
    const { filePath } = await dialog.showSaveDialog(options)
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(allData, null, 2))
      return { success: true, message: "Data exported successfully!" }
    }
    return { success: false, message: "Export cancelled." }
  } catch (error) {
    console.error("Error exporting data:", error)
    return { success: false, message: "An error occurred while exporting data." }
  }
}
