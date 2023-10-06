// src/backend/routes/scriptRoutes.js
import { exportDatabase, importDatabase } from "@/controllers/systemController"


export default function (router) {
  router.get("/exportDatabase", exportDatabase)
  router.get("/importDatabase", importDatabase)
}
