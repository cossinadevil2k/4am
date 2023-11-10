import core from "./core"
import fs from "fs"
import os from "os"
import path from "path"
async function main(stopEvent, { windows, password }) {
  let colorList = ["rgba(248, 251, 58, 0.3)", "rgba(90, 251, 58, 0.3)", "rgba(58, 238, 251, 0.3)", "rgba(251, 132, 58, 0.3)", "rgba(191, 96, 255, 0.3)", "rgba(101, 104, 255, 0.3)"]
  let idx = 0
  let flag = false
  let addressList = []
  let passphraseList = []
  let pKeyList = []
  let pList = []
  while (idx < windows.length) {
    if (flag) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } else {
      flag = true
      let cIdx = idx > colorList.length - 1 ? idx % (colorList.length - 1) : idx
      pList.push(core({ window: windows[idx], password }, next, record))
      idx++
    }
  }
  function next() {
    flag = false
  }
  function record(address, passphrase, pKey) {
    addressList.push(address)
    passphraseList.push(passphrase)
    pKeyList.push(pKey)
  }
  await Promise.allSettled(pList)
  console.log(addressList)
  console.log(passphraseList)
  console.log(pKeyList)
  const desktopDir = path.join(os.homedir(), "Desktop")
  const addPath = path.join(desktopDir, "地址.txt")
  const passPath = path.join(desktopDir, "助记词.txt")
  const pKeyPath = path.join(desktopDir, "私钥.txt")
  let addressStr = ""
  let passphraseStr = ""
  let pKeyLStr = ""
  if (fs.existsSync(addPath)) {
    addressStr = fs.readFileSync(addPath, { encoding: "utf-8" }) + "\r\n"
  }
  if (fs.existsSync(passPath)) {
    passphraseStr = fs.readFileSync(passPath, { encoding: "utf-8" }) + "\r\n"
  }
  if (fs.existsSync(pKeyPath)) {
    pKeyLStr = fs.readFileSync(pKeyPath, { encoding: "utf-8" }) + "\r\n"
  }

  fs.writeFileSync(addPath, addressStr + addressList.join("\r\n"))
  fs.writeFileSync(passPath, passphraseStr + passphraseList.join("\r\n"))
  fs.writeFileSync(pKeyPath, pKeyLStr + pKeyList.join("\r\n"))
}
export default main
