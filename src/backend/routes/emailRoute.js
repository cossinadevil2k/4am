import express from "express"
import * as emailController from "@/controllers/emailController"

const router = express.Router()

router.post("/email/create", emailController.createEmail)
router.post("/email/import", emailController.importEmail)
router.get("/email/detail/:id", emailController.getEmail)
router.post("/email/update", emailController.updateEmail)
router.post("/email/remove", emailController.deleteEmail)
router.get("/email/list", emailController.getEmailList)
router.get("/email/count", emailController.getCount)
router.get("/email/token/:email", emailController.getToken)
router.get("/email/check/:id", emailController.check)
router.get("/email/mails/:id", emailController.getMails)

export default router
