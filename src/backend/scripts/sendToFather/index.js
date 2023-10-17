import { login, send, switchAccount } from "@/utils/sui";
import { openBrowser } from "@/api/bitbrowser";
import { sleep } from "@/utils";
// import clipboard from "node-clipboardy";
const { clipboard } = require("electron");
import { scriptLog } from "@/utils/log";

const puppeteer = require("puppeteer-core");
async function main(stopEvent, { id, password, amount }) {
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
    let el = await suiPage.$(".flex.flex-col.gap-3 >div");

    const [copyBtn] = await el.$$("svg");
    await copyBtn.click();
    let fatherAddrs = null;
    try {
      await sleep(200);
      fatherAddrs = clipboard.readText();
      scriptLog(`获取父地址成功：${fatherAddrs}`);
    } catch (error) {
      scriptLog(error);
    }
    await suiPage.goto(
      "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens",
      { waitUntil: "networkidle0" }
    );
    await sleep(1000);
    let btn = await suiPage.$("button[data-headlessui-state='']");
    await btn.click();
    let addressList = await suiPage.$$("ul li >button.appearance-none");
    for (let i = 1; i < addressList.length; i++) {
      await switchAccount(browser, i);
      await send(browser, fatherAddrs, amount);
      await sleep(500);
    }
  }
}
export default main;
