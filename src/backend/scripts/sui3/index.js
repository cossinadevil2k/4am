import { login, send } from "@/utils/sui"
import { openBrowser, windowbounds } from "@/api/bitbrowser"
import { sleep, scrollIntoView } from "@/utils"
import { disconnect, switchAccount, connect, auth } from "@/utils/sui"
import { findElementByTypeAndText } from "@/utils"
import { scriptLog } from "@/utils/log"
const puppeteer = require("puppeteer-core")
async function main(event, { config, password }) {
  console.log(config)
  scriptLog(`窗口[${config.name}]开始执行取款任务`)
  const res = await openBrowser({
    id: config.id,
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
      startX: -10,
      startY: -15,
      col: 5,
      width: 430,
      height: 600,
      spaceX: -20,
      spaceY: -5,
    })
    let suiPage = await login(browser, password)
    await sleep(1000)
    // await disconnect(browser, "SuiFrens")
    for (let i = 0; i < 10; i++) {
      await switchAccount(browser, i)
      await widthDrawSuiFren(i)
      await sleep(2000)
    }
    async function widthDrawSuiFren(i) {
      try {
        await disconnect(browser, "Bullshark Quests")
      } catch (error) {}
      const suiFrenPage = await browser.newPage()
      await suiFrenPage.goto("https://quests.mystenlabs.com/?ref=tech.mystenlabs.com", {
        waitUntil: "networkidle0",
      })
      await sleep(500)
      const connectBtn = await findElementByTypeAndText(suiFrenPage, "Connect Wallet", "button")
      await connectBtn.click()
      await sleep(500)
      const check = await suiFrenPage.$("#terms")
      await check.click()
      await sleep(500)
      const acceptBtn = await findElementByTypeAndText(suiFrenPage, "I Accept", "button")
      await acceptBtn.click()
      await sleep(500)
      const linkBtn = await findElementByTypeAndText(suiFrenPage, "Sui Wallet", "button")
      await linkBtn.click()
      await sleep(500)
      await connect(browser)
      await suiFrenPage.waitForFunction(() => {
        const buttons = Array.from(document.querySelectorAll("button[aria-label='Connect Wallet']"))
        const redeemed = Array.from(document.querySelectorAll("div.absolute span"))
        const texts = Array.from(document.querySelectorAll("div.font-bold.text-lg.w-full.max-w-md"))
        return (buttons && buttons.some((v) => v.querySelector("span") && v.querySelector("span").innerText === "Claim Now")) || (redeemed && redeemed.some((v) => v.innerText === "Redeemed") || texts.some(v => v.innerText === 'Looks like you don’t have any rewards to claim. Check back later for announcements around future Quests.'))
      })
      //   const clamBtn = await findElementByTypeAndText(suiFrenPage, 'Claim Now', "button[aria-label='Connect Wallet']")
      const redeemed = await findElementByTypeAndText(suiFrenPage, "Redeemed", "div.absolute span")
      if (redeemed) {
        scriptLog("已领过奖励")
        await sleep(3000)
        await suiFrenPage.close()
        return
      }
      const noReward = await findElementByTypeAndText(suiFrenPage, "Looks like you don’t have any rewards to claim. Check back later for announcements around future Quests.", "div.font-bold.text-lg.w-full.max-w-md")
      if(noReward){
        scriptLog("没奖励领")
        await sleep(3000)
        await suiFrenPage.close()
        return
      }
      await suiFrenPage.evaluate(() => {
        document.querySelector("button[aria-label='Connect Wallet']").click()
      })
      await sleep(500)
      try {
        await auth(browser)
      } catch (error) {
        scriptLog(`窗口[${config.name}]:钱包[${i + 1}] clam操作授权失败,请检查余额或网络`)
        await suiFrenPage.close()
        return
      }
      await sleep(1000)
      await suiFrenPage.waitForFunction(() => {
        const redeemed = Array.from(document.querySelectorAll("div.absolute span"))
        return redeemed && redeemed.some((v) => v.innerText === "Redeemed")
      })
      const isSuccess = await findElementByTypeAndText(suiFrenPage, "Redeemed", "div.absolute span")
      if (isSuccess) {
        scriptLog("领取成功")
      } else {
        scriptLog("领取失败")
      }
      suiFrenPage.close()
    }
  }
}
export default main
