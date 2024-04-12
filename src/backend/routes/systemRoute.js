// src/backend/routes/scriptRoutes.js
import * as systemController from "@/controllers/systemController"

export default function (router) {
  router.get("/system/exportDatabase", systemController.exportDatabase)
  router.post("/system/exportDbWithOption", systemController.exportDbWithOption)
  router.get("/system/importDatabase", systemController.importDatabase)
  router.post("/system/importDbWithOption", systemController.importDbWithOption)
  router.post("/system/updateSystemSetting", systemController.updateSystemSetting)
}
