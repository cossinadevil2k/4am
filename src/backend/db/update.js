import { app } from "electron"
import { scriptLog } from "@/utils/log"
import dayjs from "dayjs"
// 从数据库或本地文件中获取当前应用的版本标记
async function getCurrentVersionTag(db) {
  // 这里只是一个示例，你可以从数据库或其他地方获取
  const system_info = await db.system_info.findOne({ type: "system_info" })
  return system_info?.version || "0.0.0"
}

function getVersionNumber(versionTag) {
  return +versionTag.split(".").join("")
}

// 设置新的版本标记到数据库或本地文件
async function setNewVersionTag(db, newVersion) {
  // 存储新的版本标记
  await db.system_info.update(
    { type: "system_info" },
    { $set: { version: newVersion } },
    {
      upsert: true,
    }
  )
}

// 实际的数据库修复函数
async function fixDatabaseFields(db, versionNumber) {
  // 执行实际的数据库字段修复操作
  console.log("修复或升级数据库")
  if (versionNumber < getVersionNumber("0.1.4")) {
    scriptLog("修复数据库字段", "修复email表中的created_at和updated_at字段为时间戳")
    try {
      // 查找匹配的文档
      const documents = await db.email.find({})

      // 对每个文档进行处理和更新
      for (const doc of documents) {
        const _created_at = new Date(doc.created_at).getTime()
        const _updated_at = new Date(doc.updated_at).getTime()

        const update = { $set: { created_at: _created_at, updated_at: _updated_at }, $unset: { _updated_at: true } }
        await db.email.update({ _id: doc._id }, update)
      }

      console.log("所有匹配的文档都已成功更新。")
    } catch (err) {
      console.error("操作失败:", err)
    }
  }
  if (versionNumber < getVersionNumber("0.1.13")) {
    scriptLog("修复数据库字段", "修改查分数据结构，删除旧有数据重新查分")
    try {
      const suiQuestSelfData = await db.sui_quest_self.find({})
      // 对每个文档进行处理和更新
      for (const v of suiQuestSelfData) {
        const update = { $set: { rankData: { ...v.rankData, update_at: new Date("2023-10-24 23:00:00").getTime() } } }
        await db.sui_quest_self.update({ _id: v._id }, update)
      }
      console.log("所有匹配的文档都已成功更新。")
    } catch (error) {
      console.error("操作失败:", err)
    }
  }
  if (versionNumber < getVersionNumber("0.1.14")) {
    scriptLog("修复数据库字段", "修改查分数据结构，删除旧有数据重新查分")
    try {
      const suiQuestSelfData = await db.sui_quest.find({})
      // 对每个文档进行处理和更新
      for (const v of suiQuestSelfData) {
        const update = { $set: { rankData: { ...v.rankData, update_at: new Date("2023-10-29 23:00:00").getTime() } } }
        await db.sui_quest.update({ _id: v._id }, update)
      }
      console.log("所有匹配的文档都已成功更新。")
    } catch (error) {
      console.error("操作失败:", err)
    }
  }
}

// 主函数
async function main(db) {
  // await setNewVersionTag(db, '0.1.12')
  const currentVersionTag = await getCurrentVersionTag(db)
  console.log(currentVersionTag)
  const newVersionTag = app.getVersion() // 新版本号，通常从 package.json 或 app.getVersion() 获取

  if (getVersionNumber(currentVersionTag) < getVersionNumber(newVersionTag)) {
    // 如果当前版本标记和新版本不同，则执行数据库修复操作
    await fixDatabaseFields(db, getVersionNumber(currentVersionTag))
    // 更新版本标记
    await setNewVersionTag(db, newVersionTag)
  }
}

export default main
