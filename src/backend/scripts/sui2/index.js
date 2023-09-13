import { login, send } from "@/utils/sui";
import { openBrowser, windowbounds } from "@/api/bitbrowser";
import { sleep, scrollIntoView } from "@/utils";
import { disconnect, switchAccount, connect, auth } from "@/utils/sui";
import { findElementByTypeAndText } from "@/utils";
import { scriptLog } from "@/utils/log";
const puppeteer = require("puppeteer-core");
async function main(event, config, password) {
  scriptLog(`窗口[${config.name}]开始执行取款任务`);
  const res = await openBrowser({
    id: config.id,
    args: [],
    extractIp: false,
  });
  if (res.success) {
    let wsEndpoint = res.data.ws;
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: null,
    });
    // setTimeout(() => {
    //   windowbounds({
    //     type: "box",
    //     width: 1920,
    //     height: 1080,
    //     seqlist: [config.seq],
    //   }).then((res) => {
    //     console.log(res);
    //   });
    // }, 5000);
    let suiPage = await login(browser, password);
    await sleep(1000);
    // await disconnect(browser, "SuiFrens")
    for (let i = 0; i < 10; i++) {
      await switchAccount(browser, i);
        await widthDrawSuiFren(i);
      const status = await widthDrawScallop();
      if (status === "success") {
        scriptLog(`窗口[${config.name}]:钱包[${i + 1}]提取成功`);
      } else if (status === "noSUI") {
        scriptLog(`窗口[${config.name}]:钱包[${i + 1}]没有可提取的SUI`);
      } else {
        scriptLog(
          `窗口[${config.name}]:钱包[${i + 1}]提取失败,重试中...(只重试两次)`
        );
        await widthDrawScallop();
      }
      await sleep(2000);
    }
    async function widthDrawScallop() {
      try {
        await disconnect(browser, "Scallop");
      } catch (error) {}
      const scollopPage = await browser.newPage();
      await scollopPage.goto("https://app.scallop.io/", {
        waitUntil: "networkidle0",
      });
      await sleep(500);
      try {
        await connect(browser);
      } catch (error) {
        const connectBtn1 = await findElementByTypeAndText(
          scollopPage,
          "Connect wallet",
          "button"
        );
        await connectBtn1.click();
        await sleep(1000);
        const connectBtn2 = await findElementByTypeAndText(
          scollopPage,
          "Sui Wallet",
          "button"
        );
        await connectBtn2.click();
        await sleep(2000);
        await connect(browser);
      }
      const elements = await scollopPage.$$(
        "div[id='headlessui-tabs-panel-:rq:'] .pool-list-tr"
      );
      let suiAsset = null;
      for (const element of elements) {
        const flag = await element.$$eval(".pool-list-td p span", (els) =>
          els.some((v) => v.innerText === "SUI")
        );
        if (flag) {
          suiAsset = element;
          break;
        }
      }
      const [supplyBtn, withdrawBtn] = await suiAsset.$$(
        "button.cursor-pointer"
      );
      await scollopPage.evaluate((element) => {
        element.scrollIntoView({ block: "center" });
      }, withdrawBtn);
      await withdrawBtn.click();
      await sleep(500);
      try {
        await scollopPage.waitForFunction(
          () =>
            document.querySelectorAll(
              '.panel-selfinfo button[id^="popover-button-"]'
            )[1].innerText !== "0 SUI supplied",
          { timeout: 20000 }
        );
      } catch (error) {
        scollopPage.close();
        return "noSUI";
      }
      const max = await findElementByTypeAndText(
        scollopPage,
        "Max",
        "div[id='headlessui-dialog-panel-:r5a:'] button"
      );
      await max.click();
      const withdrawSUIBtn = await findElementByTypeAndText(
        scollopPage,
        "Withdraw SUI",
        "div[id='headlessui-dialog-panel-:r5a:'] button"
      );
      await withdrawSUIBtn.click();
      await sleep(1000);
      await auth(browser);
      await scollopPage.waitForSelector(".notify h2");
      const isSuccess = await scollopPage.$eval(".notify h2", (el) =>
        el.innerText.includes("success")
      );
      await sleep(2000);
      await scollopPage.close();
      return isSuccess ? "success" : "fail";
    }
    async function widthDrawSuiFren(i) {
      try {
        await disconnect(browser, "Bullshark Quests");
      } catch (error) {}
      const suiFrenPage = await browser.newPage();
      await suiFrenPage.goto(
        "https://quests.mystenlabs.com/?ref=tech.mystenlabs.com",
        {
          waitUntil: "networkidle0",
        }
      );
      await sleep(500);
      const connectBtn = await findElementByTypeAndText(
        suiFrenPage,
        "Connect Wallet",
        "button"
      );
      await connectBtn.click();
      await sleep(500);
      const check = await suiFrenPage.$("#terms");
      await check.click();
      await sleep(500);
      const acceptBtn = await findElementByTypeAndText(
        suiFrenPage,
        "I Accept",
        "button"
      );
      await acceptBtn.click();
      await sleep(500);
      const linkBtn = await findElementByTypeAndText(
        suiFrenPage,
        "Sui Wallet",
        "button"
      );
      await linkBtn.click();
      await sleep(500);
      await connect(browser);
      await suiFrenPage.waitForFunction(() => {
        const buttons = Array.from(
          document.querySelectorAll("button[aria-label='Connect Wallet']")
        );
        const redeemed = Array.from(
          document.querySelectorAll("div.absolute span")
        );
        return (
          (buttons &&
            buttons.some(
              (v) =>
                v.querySelector("span") &&
                v.querySelector("span").innerText === "Claim Now"
            )) ||
          (redeemed && redeemed.some((v) => v.innerText === "Redeemed"))
        );
      });
      //   const clamBtn = await findElementByTypeAndText(suiFrenPage, 'Claim Now', "button[aria-label='Connect Wallet']")
      const redeemed = await findElementByTypeAndText(
        suiFrenPage,
        "Redeemed",
        "div.absolute span"
      );
      if (redeemed) {
        await suiFrenPage.close();
        scriptLog("已领过奖励");
        return;
      }
      await suiFrenPage.evaluate(() => {
        document.querySelector("button[aria-label='Connect Wallet']").click();
      });
      await sleep(500);
      try {
        await auth(browser);
      } catch (error) {
        scriptLog(
          `窗口[${config.name}]:钱包[${
            i + 1
          }] clam操作授权失败,请检查余额或网络`
        );
        await suiFrenPage.close();
        return;
      }
      await sleep(1000);
      await suiFrenPage.waitForFunction(() => {
        const redeemed = Array.from(
          document.querySelectorAll("div.absolute span")
        );
        return redeemed && redeemed.some((v) => v.innerText === "Redeemed");
      });
      const isSuccess = await findElementByTypeAndText(
        suiFrenPage,
        "Redeemed",
        "div.absolute span"
      );
      if (isSuccess) {
        scriptLog("领取成功");
      } else {
        scriptLog("领取失败");
      }
      suiFrenPage.close();
    }
  }
}
export default main;
