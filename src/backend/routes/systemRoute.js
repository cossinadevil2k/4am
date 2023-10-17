// src/backend/routes/scriptRoutes.js
import * as systemController from "@/controllers/systemController"

export default function (router) {
  router.get("/exportDatabase", systemController.exportDatabase)
  router.post("/exportDbWithOption", systemController.exportDbWithOption)
  router.get("/importDatabase", systemController.importDatabase)
  router.post("/importDbWithOption", systemController.importDbWithOption)
}
