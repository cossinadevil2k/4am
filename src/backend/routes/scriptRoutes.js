// src/backend/routes/scriptRoutes.js
import express from "express"
import { runScript, stopScript } from "@/controllers/scriptController"

const router = express.Router()

router.get("/run-script/:scriptName", runScript)

router.get("/stop-script/:id", stopScript)

export default router
