// src/backend/routes/scriptRoutes.js
import express from "express"
import { exportDatabase, importDatabase } from "@/controllers/systemController"

const router = express.Router()

router.get("/exportDatabase", exportDatabase)
router.get("/importDatabase", importDatabase)

export default router
