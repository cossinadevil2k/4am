import { login } from "@/utils/sui";
import { openBrowser } from "@/api/bitbrowser";
import { sleep } from "@/utils";
import { scriptLog } from "@/utils/log";
// import clipboard from "node-clipboardy";
const { clipboard } = require("electron");

const puppeteer = require("puppeteer-core");
async function main(event, id, password) {
  console.log(id);
  const res = await openBrowser({
    id: id,
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
        scriptLog(res);
        adds.push(res);
      } catch (error) {
        console.log(error);
      }
    }
    let pKeys = [];
    for (let address of adds) {
      //逐一获取私钥
      await suiPage.goto(
        `chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens?menu=/export/${address}`,
        { waitUntil: "networkidle0" }
      );
      await sleep(500);
      const psw = await suiPage.$("input[type='password']");
      const submit = await suiPage.$("button[type='submit']");
      await psw.type(password);
      await sleep(300);
      await submit.click();
      await sleep(300);
      const copy = await suiPage.$("button div.truncate.leading-none");
      await copy.click();
      await sleep(200);
      const pKey = clipboard.readText();
      pKeys.push(pKey);
      console.log(pKey);
      await suiPage.goBack();
      await sleep(200);
    }

    for (let [idx, address] of adds.entries()) {
      console.log(`地址: ${address} 私钥: ${pKeys[idx]}`);
      scriptLog(`地址: ${address} 私钥: ${pKeys[idx]}`);
    }
  }
}
export default main;
