import Datastore from "nedb-promises"
import { app } from "electron"
import path from "path"
import updateDb from "./update"

const basePath = app.getPath("userData")
const dbPath = path.join(basePath, "nedb")

// 创建一个表
const db = {
  email: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "email.db"),
  }),
  wallet: Datastore.create({
    autoload: true,
    filename: path.join(`${dbPath}/wallet`, "wallet.db"),
  }),
  over: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "over.db"),
  }),
  metaCene: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "metaCene.db"),
  }),
  a0gi: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "a0gi.db"),
  }),
  sui_lette: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "sui_lette.db"),
  }),
  sui_quest: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "sui_quest.db"),
  }),
  sui_quest_self: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "sui_quest_self.db"),
  }),
  setting_over: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "setting_over.db"),
  }),
  system_info: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "system_info.db"),
  }),
  system_setting: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "system_setting.db"),
  })
}

async function temp() {
  const suiQuestSelfData = await db.metaCene.find({})
  // 对每个文档进行处理和更新
  for (const v of suiQuestSelfData) {
    const update = { $set: { name: Number(v.name) } }
    await db.metaCene.update({ _id: v._id }, update)
  }
}
// temp()
updateDb(db) // 修复或更新数据库
export default db
