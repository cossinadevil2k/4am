import * as suiRankSelfController from "@/controllers/suiRankSelfController"

export default function (router) {
  router.post("/suiRankSelf/create", suiRankSelfController.createAccount)
  router.get("/suiRankSelf/detail/:id", suiRankSelfController.getAccount)
  router.post("/suiRankSelf/update", suiRankSelfController.updateAccount)
  router.post("/suiRankSelf/updateRank", suiRankSelfController.updateRank)
  router.post("/suiRankSelf/remove", suiRankSelfController.deleteAccount)
  router.get("/suiRankSelf/list", suiRankSelfController.getAccountList)
  router.get("/suiRankSelf/exportDb", suiRankSelfController.exportDb)
  router.get("/suiRankSelf/importDb", suiRankSelfController.importDb)
  router.post("/suiRankSelf/batchImport", suiRankSelfController.batchImport)
}
