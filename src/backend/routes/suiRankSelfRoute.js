import * as suiRankSelfController from "@/controllers/suiRankSelfController"

export default function (router) {
  router.post("/suiRankSelf/create", suiRankSelfController.createAccount)
  router.get("/suiRankSelf/detail/:id", suiRankSelfController.getAccount)
  router.post("/suiRankSelf/update", suiRankSelfController.updateAccount)
  router.post("/suiRankSelf/updateRank", suiRankSelfController.updateRank)
  router.get("/suiRankSelf/updateRankAll", suiRankSelfController.updateRankAll)
  router.post("/suiRankSelf/remove", suiRankSelfController.deleteAccount)
  router.post("/suiRankSelf/list", suiRankSelfController.getAccountList)
  router.get("/suiRankSelf/exportDb", suiRankSelfController.exportDb)
  router.get("/suiRankSelf/importDb", suiRankSelfController.importDb)
  router.get("/suiRankSelf/runLengendExport", suiRankSelfController.runLengendExport)
  router.post("/suiRankSelf/batchImport", suiRankSelfController.batchImport)
}
