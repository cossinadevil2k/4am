// src/backend/routes/scriptRoutes.js
import { runScript, stopScript } from "@/controllers/scriptController"

export default function (router) {
  router.get("/run-script/:scriptName", runScript)

  router.get("/stop-script/:id", stopScript)
}
