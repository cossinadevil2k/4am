import { sleep } from "./index";
import { findElementByTypeAndText } from "./index";
import { clipboard } from "electron";
export async function login(browser, password) {
  const page = await browser.newPage();
  await page.goto(
    "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens?menu=/accounts",
    { waitUntil: "networkidle0" }
  );
  const psw = await page.$("input[type='password']");
  const submit = await page.$("button[type='submit']");
  await psw.type(password);
  await sleep(500);
  await submit.click();
  return page;
}
export async function send(browser, address, amount) {
  const suiPage = await browser.newPage();
  await suiPage.goto(
    "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/send?type=0x2::sui::SUI",
    { waitUntil: "networkidle0" }
  );
  await sleep(500);
  const amountBtn = await suiPage.$("input[data-testid='coin-amount-input']");
  const addr = await suiPage.$("textarea[data-testid='address-input']");
  if (amount == Infinity) {
    const max = await findElementByTypeAndText(suiPage, "Max", "button");
    await max.click();
  } else {
    await amountBtn.type(amount);
  }
  clipboard.writeText(address);
  await addr.focus();
  await suiPage.keyboard.down("Control");
  await suiPage.keyboard.press("KeyV");
  await suiPage.keyboard.up("Control");
  await sleep(1000);
  const submit = await suiPage.$("button[type='submit']");
  await suiPage.waitForFunction(() => {
    const button = document.querySelector("button[type='submit']");
    return !button.disabled;
  });
  await submit.click();
  await sleep(1000);
  const sendNow = await findElementByTypeAndText(suiPage, "Send Now", "button");
  await sendNow.click();
  await suiPage.waitForFunction(() => {
    return document.querySelector("div.bg-success");
  });
  await sleep(1000);
  suiPage.close();
}
