// src/backend/routes/scriptRoutes.js
import { runScript, stopScript } from "@/controllers/scriptController"

export default function (router) {
  router.post("/run-script", runScript)

  router.post("/stop-script", stopScript)
}
