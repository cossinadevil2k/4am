import puppeteer from "puppeteer-core"
import path from "path"
import { findElementByTypeAndText, sleep } from "../../utils"
import { scriptLog } from "../../utils/log"
import randomUserAgent from "random-useragent"
import dayjs from "dayjs"
import { login } from "../../utils/alby"
import { exec } from "child_process"

const default_mintTime = 5 * 60 * 1000
const default_sleepTime = 3 * 60 * 1000
const default_loginTime = 30 * 1000
const default_threads = "12"
const width = 1000
const height = 1200
const default_pathToExtension = "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\iokeahhehimjnekafflcihljlcjccdbe\\3.6.0_0"
const default_executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const default_userDataDir = "C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\User Data"

async function main(stopEvent, { setting }) {
  const {
    mintTime = default_mintTime,
    sleepTime = default_sleepTime,
    loginTime = default_loginTime,
    threads = default_threads,
    password,
    pathUserData: userDataDir = default_userDataDir,
    pathChrome: executablePath = default_executablePath,
    pathExtensions: pathToExtension = default_pathToExtension,
    proxy,
  } = setting

  let proxyServer = ""
  if (proxy) {
    // 配置 SOCKS5 代理，包含用户名和密码
    // const proxyServer = "socks5://username:password@your-socks5-proxy-server:port"
    proxyServer = `--proxy-server="socks5://${proxy}"`
  }

  // const useragent = randomUserAgent.getRandom((ua) => {
  //   if(ua.browserName === "Chrome"){
  //     console.log(ua.browserVersion)
  //     // parseFloat(ua.browserVersion) >= 110
  //   }
  //   return ua.browserName === "Chrome"
  // })
  const useragent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0"
  scriptLog(`mintTime: ${mintTime}, sleepTime: ${sleepTime}, loginTime: ${loginTime}, threads: ${threads}`)
  scriptLog(`proxy: ${proxy}`)
  
  await handleCf()
 
  await sleep(21000)

  await openBrowser()

  async function handleCf() {
    // 指定网站 URL
    const websiteUrl = "https://noscription.org"

    // 启动 Chrome 并打开指定网站，并配置 SOCKS5 代理
    const openChrome = () => {
      const command = `"${executablePath}" ${proxyServer} "${websiteUrl}"`
      scriptLog(`启动浏览器过CF,将等待20s, command:${command}`)
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error opening Chrome: ${error.message}`)
          return
        }
        if (stderr) {
          console.error(`Chrome error: ${stderr}`)
          return
        }

        console.log(`Chrome opened successfully`)
        // 等待 20 秒后关闭 Chrome 页面
        setTimeout(closeChrome, 20000)
      })
    }

    // 关闭 Chrome 页面
    const closeChrome = () => {
      exec("taskkill /F /IM chrome.exe", (error, stdout, stderr) => {
        if (error) {
          console.error(`Error closing Chrome: ${error.message}`)
          return
        }
        if (stderr) {
          console.error(`Chrome closing error: ${stderr}`)
          return
        }

        console.log(`Chrome closed successfully`)
      })
    }

    // 执行示例
    openChrome()
  }

  async function mintNoss(browser, page, count = 1) {
    scriptLog(`开始mint,第${count}轮`)
    async function next() {
      const newPage = await browser.newPage()
      // await newPage.setUserAgent(useragent)
      await newPage.evaluateOnNewDocument(() => {
        Object.defineProperties(navigator, { webdriver: { get: () => false } })
      })
      await newPage.goto("https://noscription.org", { waitUntil: "networkidle2" })
      await newPage.waitForSelector("#__next")
      await mintNoss(browser, newPage, ++count)
    }
    try {
      const mint = await findElementByTypeAndText(page, "Mint", "button")
      await mint.click()
      await page.waitForFunction(
        () => {
          const button = Array.from(document.querySelectorAll("button")).find((v) => v.innerText === "MINE & MINT")
          return !button.attributes.disabled
        },
        { timeout: 30 * 1000 }
      )
      const ipt = await page.$('input[value="2"]')
      await ipt.focus()
      await page.keyboard.down("Control")
      await page.keyboard.press("KeyA")
      await page.keyboard.up("Control")
      await ipt.type(threads)
      await sleep(1000)
      await page.evaluate(() => {
        Array.from(document.querySelectorAll(".MuiFormControl-root")).forEach((v) => {
          v.style = "height: 20px;"
        })
        document.querySelector('input[data-indeterminate="false"]').click()
        const button = Array.from(document.querySelectorAll("button")).find((v) => v.innerText === "MINE & MINT")
        button.click()
      })
      await sleep(mintTime)
      await page.close()
      scriptLog("休息中...")
      await sleep(sleepTime) // 休息3分钟
      await next()
    } catch (error) {
      scriptLog(error)
      await sleep(5000)
      await page.close()
      await next()
    }
  }
  async function openBrowser() {
    const browser = await puppeteer.launch({
      ignoreDefaultArgs: ["--enable-automation"],
      headless: false,
      executablePath,
      args: [
        "--no-sandbox",
        `--window-size=${width},${height}`,
        "--disable-ios-password-suggestions",
        `--disable-extensions-except=${path.resolve(pathToExtension)}`,
        `--load-extension=${path.resolve(pathToExtension)}`,
        proxyServer,
      ].filter(v => v),
      defaultViewport: null,
      userDataDir,
    })
    const albyPage = await login(browser, password)
    await albyPage.close()
    await sleep(5000)
    const page = await browser.newPage()
    // await page.setUserAgent(useragent)
    await page.evaluateOnNewDocument(() => {
      Object.defineProperties(navigator, { webdriver: { get: () => false } })
    })
    await page.goto("https://noscription.org", { waitUntil: "networkidle2" })
    await page.waitForSelector("#__next")
    await sleep(loginTime)
    await mintNoss(browser, page, 1)
  }
}
export default main
