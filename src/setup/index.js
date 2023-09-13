import initFolder from "./initFolder"
import initIpc from "./initIpc"
import server from "@/main.js"
export default function setup() {
  initFolder()
  initIpc()
  server()
}
