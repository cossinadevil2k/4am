import { login, disconnect, switchAccount, connect, auth } from "@/utils/sui"
import { findElementByTypeAndText, scrollIntoView } from "@/utils/index"
import { openBrowser } from "@/api/bitbrowser"
import { sleep } from "@/utils"
import { clipboard } from "electron"
import { scriptLog } from "@/utils/log"
import puppeteer from "puppeteer-core"
import { windowbounds } from "@/api/bitbrowser"
async function excute({ window, password, link, index = 0 }) {
  let browser = null
  let idx = index
  scriptLog(`执行邀请脚本，执行窗口${window.name},已进行到第${idx + 1}个地址`)
  try {
    const res = await openBrowser({
      id: window.id,
      args: [],
      extractIp: true,
    })
    // console.log(res)
    if (res.success) {
      let wsEndpoint = res.data.ws
      browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
        defaultViewport: null,
      })
      windowbounds({
        type: "box",
        startX: -10,
        startY: -10,
        col: 6,
        width: 345,
        height: 500,
        spaceX: -20,
        spaceY: 10,
      })
      let page = await login(browser, password)
      while (idx < 10) {
        await disconnect(browser, "Bullshark Quests")
        await switchAccount(browser, idx)
        await page.goto(link, { waitUntil: "networkidle0" })
        await sleep(500)
        const closedBtn = await findElementByTypeAndText(page, "...", "button")
        if (closedBtn) {
          await closedBtn.click()
          await sleep(200)
          const disconnectBtn = await findElementByTypeAndText(page, "Disconnect", "div")
          await disconnectBtn.click()
          await sleep(500)
        }
        const connectBtn = await findElementByTypeAndText(page, "Connect Wallet", "button")
        await connectBtn.click()
        await sleep(500)
        const check = await page.$("#terms")
        await check.click()
        await sleep(500)
        const acceptBtn = await findElementByTypeAndText(page, "I Accept", "button")
        await acceptBtn.click()
        await sleep(500)
        const linkBtn = await findElementByTypeAndText(page, "Sui Wallet", "button")
        await linkBtn.click()
        await sleep(500)
        await connect(browser)
        await sleep(5000)
        const claimBtn = await findElementByTypeAndText(page, "claim questpass", "button")
        console.log(!!claimBtn)
        if (!claimBtn) {
          idx++
          continue
        }
        await scrollIntoView(page, claimBtn)
        await sleep(1000)
        let flag = true
        while (flag) {
          await claimBtn.click()
          const response = await page.waitForResponse((response) => response.url().includes("https://quests.mystenlabs.com/api/trpc/claimQuestPass?batch=1"), {
            timeout: 60000,
          })
          const data = await response.json()
          scriptLog(data)
          if (response.status() == 200) {
            await auth(browser)
            await sleep(1000)
            idx++
            flag = false
            continue
          }
          if (data?.[0].error.message.includes("Too many requests")) {
            await browser.close()
            await sleep(5000)
            return await excute({ window, password, link, index: idx })
          }
          await sleep(10000)
        }
      }
    } else {
      await sleep(5000)
      scriptLog("窗口启动失败，重启中")
      await excute({ window, password, link, index: idx })
    }
  } catch (error) {
    scriptLog(error)
    await browser.close()
    await sleep(5000)
    console.log("start again")
    await excute({ window, password, link, index: idx })
  }
}
export default excute
