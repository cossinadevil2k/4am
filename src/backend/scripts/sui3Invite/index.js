import excute from "./excute"
import fs from "fs"
import os from "os"
import path from "path"
async function main(stopEvent, { windows, password }) {
  let idx = 0
  let flag = false
  let pList = []
  while (idx < windows.length) {
    if (flag) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } else {
      flag = true
      pList.push(excute({ window: windows[idx], password, index: 0 }, next))
      idx++
    }
  }
  function next() {
    flag = false
  }
  await Promise.allSettled(pList)
}
export default main
