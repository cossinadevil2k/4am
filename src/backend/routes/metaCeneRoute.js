import * as metaCeneController from "@/controllers/metaCeneController"

export default function (router) {
  router.post("/metaCene/create", metaCeneController.createAccount)
  router.get("/metaCene/detail/:id", metaCeneController.getAccount)
  router.post("/metaCene/update", metaCeneController.updateAccount)
  router.post("/metaCene/remove", metaCeneController.deleteAccount)
  router.get("/metaCene/list", metaCeneController.getAccountList)
  router.get("/metaCene/getDetail/:id", metaCeneController.getDetail)
  router.get("/metaCene/wakeUp/:id", metaCeneController.wakeUp)
  router.get("/metaCene/getSpar/:id", metaCeneController.getSpar)
  router.get("/metaCene/doTask/:id", metaCeneController.doTask)
  router.post("/metaCene/roleLvUp", metaCeneController.roleLvUp)
  router.post("/metaCene/charge", metaCeneController.charge)
  router.post("/metaCene/useEnergy", metaCeneController.useEnergy)
  router.post("/metaCene/getLottoIndex", metaCeneController.getLottoIndex)
}
