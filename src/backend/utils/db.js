import Datastore from "nedb-promises"
import { app } from "electron"
import path from "path"

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
  setting_over: Datastore.create({
    autoload: true,
    filename: path.join(dbPath, "setting_over.db"),
  }),
}

export default db
