import { sleep } from "./index"
import { findElementByTypeAndText, scrollIntoView, findAndClick } from "./index"

const HOME_PAGE = "chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/popup.html#home"
const LOGIN_PAGE = "chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/popup.html#unlock"
const GET_SEND_PAGE = (coinId) => `chrome-extension://mcohilncbfahbmgdjkbpemcciiolgcge/popup.html#send/${coinId}/edit`
export async function login(browser, password) {
    const page = await browser.newPage()
    await page.goto(LOGIN_PAGE, { waitUntil: "networkidle0" })
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
// 步骤之间的判断还需要细化，目前直接用等待时间代替
export async function send(browser,coinId, addr, amount) {
    const page = await browser.newPage()
    await page.goto(GET_SEND_PAGE(coinId), { waitUntil: "networkidle0" })
    await sleep(500)
    const addrIpt = await page.$(".send-form__input-custom-render>textarea")
    await addrIpt.type(addr)
    await sleep(500)
    const nextBtn = await findElementByTypeAndText(page, "Next", "button")
    await nextBtn.click()
    await sleep(1000)
    const amountIpt = await page.$(".okui-input-input.coinAmount__input__core")
    await amountIpt.type(amount)
    await sleep(1000)
    const confirmBtn = await findElementByTypeAndText(page, "Confirm", "button")
    await confirmBtn.click()
    await sleep(1000)
    const confirmBtn2 = await findElementByTypeAndText(page, "Confirm", "button")
    await confirmBtn2.click()
}

export async function getAddr() { 
    return null
}