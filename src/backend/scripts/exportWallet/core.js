import { login, registry, switchAccount } from "@/utils/sui"
import { findElementByTypeAndText, scrollIntoView } from "@/utils/index"
import { openBrowser } from "@/api/bitbrowser"
import { sleep } from "@/utils"
const { clipboard } = require("electron")
import { scriptLog } from "@/utils/log"
import puppeteer from "puppeteer-core"
// import { batchImport } from "@/services/suiRankSelfService"
import { windowbounds } from "@/api/bitbrowser"

export default async function ({ window, password, bgColor }, next, record) {
  try {
    const res = await openBrowser({
      id: window.id,
      args: [],
      extractIp: false,
    })
    if (res.success) {
      let wsEndpoint = res.data.ws
      const browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
        defaultViewport: null,
      })
      windowbounds({
        type: "box",
        width: 380,
        height: 840,
      })
      let adds = []
      let pKeys = []
      let passphrases = []
      await sleep(2000)
      const page = await login(browser, password)
      // const page = await browser.newPage()
      console.log("注册完成")
      // 创建10个账户
      await page.goto("chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens?menu=%2Faccounts", { waitUntil: "networkidle0" })
      await sleep(500)
      await page.$eval("#toaster-portal-container", (el) => (el.style = "display: none;")) // 干掉消息提示防止挡住按钮
      let els = await page.$$(".flex.flex-col.gap-3 >div")
      const createBtn = await findElementByTypeAndText(page, "Create New Account", "button")
      setTimeout(() => {
        next() // 到此剪贴板已经快用完不会错乱了
      }, 1500)
      while (els.length < 10) {
        await scrollIntoView(page, createBtn)
        await sleep(200)
        await createBtn.click()
        await sleep(200)
        els = await page.$$(".flex.flex-col.gap-3 >div")
        console.log("已创建：", els.length)
        await sleep(100)
      }
      console.log("创建完成")
      // 获取所有地址
      for (let el of els) {
        const [copyBtn] = await el.$$("svg")
        await scrollIntoView(page, copyBtn)
        await copyBtn.click()
        await sleep(200)
        const res = clipboard.readText()
        adds.push(res)
      }
      // 助记词
      await page.goto("chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens?menu=/recovery-passphrase")
      await sleep(200)
      const psw = await page.$("input[type='password']")
      const submit = await page.$("button[type='submit']")
      await psw.type(password)
      await sleep(200)
      await submit.click()
      await sleep(200)
      const showBtn = await page.$("svg.block")
      await showBtn.click()
      await sleep(200)
      const passphrase = await page.$eval(".font-medium.text-pBody.text-steel-darker", (el) => {
        return el.innerHTML.replaceAll(/\<span\>|\<\/span\>/g, "")
      })
      passphrases.push(passphrase)

      for (let address of adds) {
        //逐一获取私钥
        await page.goto(`chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens?menu=/export/${address}`, { waitUntil: "networkidle0" })
        await sleep(200)
        const psw = await page.$("input[type='password']")
        const submit = await page.$("button[type='submit']")
        await psw.type(password)
        await sleep(200)
        await submit.click()
        await sleep(200)
        const showBtn = await page.$("svg.block")
        await showBtn.click()
        const pKey = await page.$eval(".font-medium.text-pBody.text-steel-darker", (el) => el.innerHTML)
        scriptLog(pKey)
        await page.goBack()
        await sleep(200)
        pKeys.push(pKey)
      }
      const addrstr = `${window.name}\r\n${adds.join("\r\n")}`
      const passphrasestr = `${window.name}\r\n${passphrases.join("\r\n")}`
      const pKeystr = `${window.name}\r\n${pKeys.join("\r\n")}`
      record(addrstr, passphrasestr, pKeystr)
      // await batchImport(adds, `${window.name}`, bgColor)
      browser.close()
    }
  } catch (error) {
    scriptLog(error)
  }
}
