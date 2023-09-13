import { login, send } from "@/utils/sui";
import { openBrowser } from "@/api/bitbrowser";
import { sleep } from "@/utils";
// import clipboard from "node-clipboardy";
const { clipboard } = require("electron");

const puppeteer = require("puppeteer-core");
async function main(event, id, password) {
  const res = await openBrowser({
    id,
    args: [],
    extractIp: false,
  });
  if (res.success) {
    let wsEndpoint = res.data.ws;
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: null,
    });
    let suiPage = await login(browser, password);
    await sleep(1000);
    let els = await suiPage.$$(".flex.flex-col.gap-3 >div");

    //获取所有地址
    let adds = [];
    for (let el of els) {
      const [copyBtn] = await el.$$("svg");
      await copyBtn.click();
      try {
        await sleep(200);
        const res = clipboard.readText();
        console.log(res);
        adds.push(res);
      } catch (error) {
        console.log(error);
      }
    }

    for (let [idx, address] of adds.entries()) {
      if (idx === 0) continue;
      await send(browser, address, '15.2');
    }
  }
}
export default main;
