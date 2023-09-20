import express from "express"
import * as overController from "@/controllers/overController"

const router = express.Router()

router.post("/over/create", overController.createAccount)
router.get("/over/detail/:id", overController.getAccount)
router.post("/over/update", overController.updateAccount)
router.post("/over/remove", overController.deleteAccount)
router.get("/over/list", overController.getAccountList)
router.get("/over/emails", overController.getEmails)
router.get("/over/dailyReward/:email", overController.getDailyReward)
router.get("/over/dailyQuiz/:email", overController.getDailyQuiz)

export default router
