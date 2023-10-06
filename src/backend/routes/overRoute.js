import * as overController from "@/controllers/overController"

export default function (router) {
  router.post("/over/create", overController.createAccount)
  router.get("/over/detail/:id", overController.getAccount)
  router.post("/over/update", overController.updateAccount)
  router.post("/over/remove", overController.deleteAccount)
  router.get("/over/list", overController.getAccountList)
  router.get("/over/emails", overController.getEmails)
  router.get("/over/dailyReward/:email", overController.getDailyReward)
  router.get("/over/dailyQuiz/:email", overController.getDailyQuiz)
  router.get("/over/getSetting", overController.getSetting)
  router.post("/over/updateSetting", overController.updateSetting)
}
