// src/backend/routes/scriptRoutes.js
import express from "express"
import { exportDatabase } from "@/controllers/systemController"

const router = express.Router()

router.get("/exportDatabase", exportDatabase)

export default router
