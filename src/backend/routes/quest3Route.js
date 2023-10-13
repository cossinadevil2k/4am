import * as quest3Controller from "@/controllers/quest3Controller"

export default function (router) {
  router.get("/quest3/watchHistory", quest3Controller.watchHistory)
  router.get("/quest3/stopWatch", quest3Controller.stopWatch)
  router.get("/quest3/getHistoryRecord", quest3Controller.getHistoryRecord)
}
