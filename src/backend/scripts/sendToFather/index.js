import { login, send, switchAccount } from "@/utils/sui"
import { openBrowser, windowbounds } from "@/api/bitbrowser"
import { sleep, findAndClick } from "@/utils"
// import clipboard from "node-clipboardy";
const { clipboard } = require("electron")
import { scriptLog } from "@/utils/log"

const puppeteer = require("puppeteer-core")
async function main(stopEvent, { id, name, password, amount, max }) {
  console.log(id, name, password, amount, max)
  const res = await openBrowser({
    id,
    args: [],
    extractIp: false,
  })
  console.log(res)
  if (res.success) {
    let wsEndpoint = res.data.ws
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: null,
    })
    windowbounds({
      type: "box",
      startX: -10,
      startY: -15,
      col: 5,
      width: 430,
      height: 650,
      spaceX: -20,
      spaceY: -5,
    })
    let suiPage = await login(browser, password)
    await sleep(1000)
    let el = await suiPage.$(".flex.flex-col.gap-3 >div")

    const [copyBtn] = await el.$$("svg")
    await copyBtn.click()
    let fatherAddrs = null
    try {
      await sleep(200)
      fatherAddrs = clipboard.readText()
      scriptLog(`获取父地址成功：${fatherAddrs}`)
      await suiPage.goto("chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens", { waitUntil: "networkidle0" })
      await sleep(1000)
      await findAndClick(suiPage, "button[data-headlessui-state='']")
    } catch (error) {
      scriptLog(`窗口${name}归集失败`)
      scriptLog(error)
    }
    let addressList = await suiPage.$$("ul li >button.appearance-none")
    await suiPage.close()
    for (let i = 1; i < addressList.length; i++) {
      try {
        await switchAccount(browser, i)
        await send(browser, fatherAddrs, max ? Infinity : amount)
        await sleep(500)
      } catch (error) {
        scriptLog(`窗口${name}，第${i + 1}个地址归集失败`)
        scriptLog(error)
        continue
      }
    }
  }
}
export default main
