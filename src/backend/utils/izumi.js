import { sleep } from "."

const SWAP_PAGE = "https://izumi.finance/trade/swap"

export async function connect(){

}

export async function swap(browser){
    const page = await browser.newPage()
    await page.goto(SWAP_PAGE, { waitUntil: "networkidle0" })
    await sleep(500)
    const [fromBtn, toBtn] = await page.$$("img.chakra-image[src='/assets/trade/lightClick.svg']")
    await fromBtn.click()
}