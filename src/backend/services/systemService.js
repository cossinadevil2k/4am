import { dialog } from "electron"
import db from "@/db"
import fs from "fs"
import dayjs from "dayjs"
export const exportDb = async () => {
  try {
    const emailData = await db.email.find({})
    const overData = await db.over.find({})
    const settingOverData = await db.setting_over.find({})
    const systemInfoData = await db.system_info.find({})

    const allData = {
      email: emailData,
      over: overData,
      setting_over: settingOverData,
      system_info: systemInfoData,
    }
    const defaultFileName = `4am-db-${dayjs().format("YYMMDDHHmmss")}.json`
    const options = {
      title: "Save Database Backup",
      defaultPath: defaultFileName,
      filters: [{ name: "JSON", extensions: ["json"] }],
    }
    const { filePath } = await dialog.showSaveDialog(options)
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(allData, null, 2))
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    throw new Error("An error occurred while exporting data.")
  }
}
export const exportDbWithOption = async (names) => {
  const pList = names.map((v) => db[v].find({}))
  Promise.all(pList).then(async (rList) => {
    const allData = {}
    rList.forEach((v, i) => {
      allData[names[i]] = v
    })
    const defaultFileName = `4am-db-${names.join("-")}-${dayjs().format("YYMMDDHHmm")}.json`
    const options = {
      title: "Save Database Backup",
      defaultPath: defaultFileName,
      filters: [{ name: "JSON", extensions: ["json"] }],
    }
    const { filePath } = await dialog.showSaveDialog(options)
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(allData, null, 2))
    }
  })
}
export const importDbWithOption = async (names) => {
  try {
    const filePaths = dialog.showOpenDialogSync({
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    })
    if (filePaths && filePaths.length > 0) {
      const data = JSON.parse(fs.readFileSync(filePaths[0], "utf8"))
      for (let key of names) {
        await db[key].remove({}, { multi: true })
        await db[key].insert(data[key])
      }
    }
  } catch (error) {
    console.error("Error importing database:", error)
    throw new Error(`Error importing database: ${error}`)
  }
}
// 从文件导入数据库数据
export const importDb = async () => {
  try {
    const filePaths = dialog.showOpenDialogSync({
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    })

    if (filePaths && filePaths.length > 0) {
      const data = JSON.parse(fs.readFileSync(filePaths[0], "utf8"))
      await db.email.remove({}, { multi: true })
      await db.over.remove({}, { multi: true })
      await db.setting_over.remove({}, { multi: true })
      await db.system_info.remove({}, { multi: true })

      await db.email.insert(data.email)
      await db.over.insert(data.over)
      await db.setting_over.insert(data.setting_over)
      await db.system_info.insert(data.system_info)

      console.log("Database imported successfully.")
    }
  } catch (error) {
    console.error("Error importing database:", error)
    throw new Error(`Error importing database: ${error}`)
  }
}


// 更新系统设置
export const updateSystemSetting = async (settings) => {
  await db.system_setting.update({  type: "system_setting" }, { $set: settings }, {
    upsert: true,
  })
}