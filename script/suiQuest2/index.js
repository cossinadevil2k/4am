import { openBrowser } from "../api/bitbrowser";
import { sleep } from "../utils";
const puppeteer = require("puppeteer-core");

async function main() {
  const res = await openBrowser({
    id: "7e48d5f76bda4b7ebb39ccdea3c00bd2",
    args: [],
    extractIp: false,
  });
  if (res.success) {
    let wsEndpoint = res.data.ws;
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto(
      "chrome-extension://mcbigmjiafegjnnogedioegffbooigli/ui.html#/home",
      { waitUntil: "networkidle0" }
    );
    const psw = await page.$("input[type='password']");
    const submit = await page.$("button[data-testid='submit']");
    await psw.type("73782DoU.");
    await sleep(1000);
    await submit.click();
    await sleep(1000);
    const centus = await browser.newPage();
    await centus.goto(
      "https://app.cetus.zone/swap/?from=0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN&to=0x2::sui::SUI",
      {
        waitUntil: "networkidle0",
      }
    );

    // const kriya = await browser.newPage();
    // await kriya.goto("https://www.app.kriya.finance/spot/swap", {
    //   waitUntil: "networkidle0",
    // });

    // await kriya.$$eval("button", (els) => {
    //   const el = els.find(
    //     (el) =>
    //       el.querySelector("p") &&
    //       el.querySelector("p").innerText === "Connect Wallet"
    //   );
    //   el.click();
    // });
    // await sleep(1000);
    // await kriya.$$eval("div[style='z-index: 10000;']", (els) => {
    //   const el = els.find(
    //     (el) =>
    //       el.querySelector("p") &&
    //       el.querySelector("p").innerText === "Sui Wallet"
    //   );
    //   el.click();
    // });
    // await sleep(5000);
    // const targets = await browser.targets();
    // const approval = targets
    //   .reverse()
    //   .find((v) =>
    //     v
    //       .url()
    //       .includes(
    //         "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/dapp/connect"
    //       )
    //   );
    // if (approval) {
    //   const approvalPage = await approval.page();
    //   approvalPage.$$eval("button", (els) => {
    //     const el = els.find(
    //       (el) =>
    //         el.querySelector("div") &&
    //         el.querySelector("div").innerText === "Connect"
    //     );
    //     el.click();
    //   });
    // }

    // const changeWalletBtn = await page.$('button.cursor-pointer')
    // await changeWalletBtn.click()
  } else {
    console.error("浏览器打开失败");
  }
}

export default main;
