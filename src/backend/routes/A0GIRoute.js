import A0GIController from "@/controllers/A0GIController"


export default function (router) {
    router.post("/a0gi/add", A0GIController.add)
    router.get("/a0gi/detail/:id", A0GIController.detail)
    router.post("/a0gi/update", A0GIController.update)
    router.post("/a0gi/remove", A0GIController.remove)
    router.get("/a0gi/list", A0GIController.list)
    router.get("/a0gi/faucet", A0GIController.faucet)
    router.get("/a0gi/getBalance", A0GIController.getBalance)
    router.get("/a0gi/export", A0GIController.export)
}
