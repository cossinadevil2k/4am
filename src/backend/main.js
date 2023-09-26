// src/backend/main.js
import express from "express"
import scriptRoutes from "./routes/scriptRoutes"
import emailRoute from "./routes/emailRoute"
import overRoute from "./routes/overRoute"
import systemRoute from "./routes/systemRoute"
import fs from "fs"
import path from "path"

function server() {
  const app = express()
  const port = process.env.VUE_APP_BACKEND_PORT || 3333

  // 解析JSON请求体
  app.use(express.json())

  // 解析表单请求体
  app.use(express.urlencoded({ extended: true }))

  // 日志记录
  app.use((req, res, next) => {
    const log = `${new Date().toISOString()} ${req.method} ${req.url}`
    fs.appendFile(path.join(__dirname, "access.log"), log + "\n", (err) => {
      if (err) console.error(err)
    })
    next()
  })

  // 错误处理
  app.use((error, req, res, next) => {
    const { status = 500, message = "Internal Server Error" } = error
    console.log(message)
    res.status(status).json({ code: status, message, data: null })
  })
  app.use(scriptRoutes)
  app.use(emailRoute)
  app.use(overRoute)
  app.use(systemRoute)
  app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`)
  })
}

export default server
