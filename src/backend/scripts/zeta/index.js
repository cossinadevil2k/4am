import { login, send, getAddr } from "@/utils/okx"
import { swap } from "@/utils/izumi"
import { openBrowser, windowbounds } from "@/api/bitbrowser"
import { sleep, scrollIntoView } from "@/utils"
import { findElementByTypeAndText } from "@/utils"
import { scriptLog } from "@/utils/log"
const puppeteer = require("puppeteer-core")
async function sendToSelf(browser) {
    const addr = await getAddr() || "0xdf7d2f31f2c204223925b4fc5b318a55f8c19822"
    const amount = (Math.random() * 0.5).toFixed(2)
    await send(browser, 23000, addr, amount)
}
async function swapIzumi(browser){
    await swap(browser)
}
async function main(event, { config, password }) {
    console.log(config)
    scriptLog(`窗口[${config.name}]开始执行zeta任务`)
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
        await login(browser, password)
        await sleep(1000)
        await sendToSelf(browser)
        // await swapIzumi(browser)
    } else {
        scriptLog(`窗口[${config.name}]打开失败`)
        scriptLog(res)
    }
}
export default main
