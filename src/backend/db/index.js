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
  over: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "over.db"),
  }),
  sui_lette: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "sui_lette.db"),
  }),
  sui_quest: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "sui_quest.db"),
  }),
  setting_over: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "setting_over.db"),
  }),
  system_info: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "system_info.db"),
  }),
}
updateDb(db) // 修复或更新数据库
export default db
