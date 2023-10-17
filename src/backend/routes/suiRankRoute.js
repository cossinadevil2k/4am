import * as suiRankController from "@/controllers/suiRankController"

export default function (router) {
  router.post("/suiRank/create", suiRankController.createAccount)
  router.get("/suiRank/detail/:id", suiRankController.getAccount)
  router.post("/suiRank/update", suiRankController.updateAccount)
  router.post("/suiRank/updateRank", suiRankController.updateRank)
  router.post("/suiRank/remove", suiRankController.deleteAccount)
  router.get("/suiRank/list", suiRankController.getAccountList)
  router.get("/suiRank/exportDb", suiRankController.exportDb)
  router.get("/suiRank/importDb", suiRankController.importDb)
}
