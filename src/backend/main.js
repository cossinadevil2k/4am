// src/backend/main.js
import express from "express"
import scriptRoutes from "./routes/scriptRoutes"

function server() {
  const app = express()
  const port = process.env.VUE_APP_BACKEND_PORT || 3333

  app.use(scriptRoutes)

  app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`)
  })
}

export default server
