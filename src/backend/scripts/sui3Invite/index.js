import excute from "./excute"
import fs from "fs"
import os from "os"
import path from "path"
async function main(stopEvent, { windows, password, link }) {
  let idx = 0
  let pList = []
  while (idx < windows.length) {
      pList.push(excute({ window: windows[idx], password, link, index: 0 }))
      await new Promise((resolve) => setTimeout(resolve, 3000))
    idx++
  }
  await Promise.allSettled(pList)
}
export default main
