import * as walletController from "@/controllers/walletController"


export default function (router) {
  router.post("/wallet/add", walletController.add)
  router.get("/wallet/detail/:id", walletController.detail)
  router.post("/wallet/update", walletController.update)
  router.post("/wallet/remove", walletController.remove)
  router.post("/wallet/createWallet", walletController.createWallet)
  router.get("/wallet/list", walletController.list)
  router.get("/wallet/walletList", walletController.walletList)
  router.get("/wallet/faucet", walletController.faucet)
  router.get("/wallet/getBalance", walletController.getBalance)
  router.post("/wallet/exportFile", walletController.exportFile)
}
