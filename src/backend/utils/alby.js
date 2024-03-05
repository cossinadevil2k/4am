import { sleep } from "./index"
import { findElementByTypeAndText, scrollIntoView, findAndClick } from "./index"
import { clipboard } from "electron"
import { scriptLog } from "./log"
// 登录
export async function login(browser, password) {
  const page = await browser.newPage()
  await page.goto("chrome-extension://iokeahhehimjnekafflcihljlcjccdbe/options.html", { waitUntil: "networkidle0" })
  await sleep(500)
  const psw = await page.$("input[type='password']")
  const submit = await page.$("button[type='submit']")
  if (!psw) return page
  await psw.type(password)
  await sleep(200)
  await scrollIntoView(page, submit)
  await sleep(200)
  await submit.click()
  return page
}