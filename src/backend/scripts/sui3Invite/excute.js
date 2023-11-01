import { login, disconnect, switchAccount, connect, auth } from "@/utils/sui"
import { findElementByTypeAndText, scrollIntoView } from "@/utils/index"
import { openBrowser } from "@/api/bitbrowser"
import { sleep } from "@/utils"
import { clipboard } from "electron"
import { scriptLog } from "@/utils/log"
import puppeteer from "puppeteer-core"
import { windowbounds } from "@/api/bitbrowser"
async function excute({ window, password, link = "http://quests.mystenlabs.com/referrals/0x3481de1c6aa29569f901393ba797ff176731f3288b5d78a9425ec7837a8e562e", index = 0 }) {
  let idx = index
  const res = await openBrowser({
    id: window.id,
    args: [],
    extractIp: true,
  })
  if (res.success) {
    let wsEndpoint = res.data.ws
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: null,
    })
    windowbounds({
      type: "box",
      width: 500,
      height: 650,
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
      await sleep(500)
      try {
        const claimBtn = await findElementByTypeAndText(page, "claim questpass", "button")
        console.log(!!claimBtn)
        if (!claimBtn) {
          idx++
          continue
        }
        await scrollIntoView(page, claimBtn)
        await sleep(1000)
        await claimBtn.click()
        const response = await page.waitForResponse((response) => response.url().includes("https://quests.mystenlabs.com/api/trpc/claimQuestPass?batch=1"), {
          timeout: 60000,
        })
        console.log(response.status())
        if (response.status() !== 200) {
          await browser.close()
          await sleep(3000)
          return await excute({ window, password, link, index: idx })
        }
        await auth(browser)
        await sleep(1000)
        idx++
      } catch (error) {
        scriptLog(error)
      }
    }
  }
}
export default excute
