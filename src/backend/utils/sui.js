import { sleep } from "./index";
import { findElementByTypeAndText, scrollIntoView } from "./index";
import { clipboard } from "electron";
import { scriptLog } from "./log";
// 登录
export async function login(browser, password) {
  const page = await browser.newPage();
  await page.goto(
    "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens?menu=/accounts",
    { waitUntil: "networkidle0" }
  );
  // const title = await page.$eval("h6", (el) => el.innerText);
  // if (title === "Accounts") return page;
  await sleep(1000);
  const psw = await page.$("input[type='password']");
  const submit = await page.$("button[type='submit']");
  if (!psw) return page;
  await psw.type(password);
  await sleep(500);
  await submit.click();
  return page;
}
// 发送
export async function send(browser, address, amount) {
  const suiPage = await browser.newPage();
  await suiPage.goto(
    "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/send?type=0x2::sui::SUI",
    { waitUntil: "networkidle0" }
  );
  await sleep(500);
  await suiPage.waitForSelector("input[data-testid='coin-amount-input']", { timeout: 15000 });
  const amountBtn = await suiPage.$("input[data-testid='coin-amount-input']");
  const addr = await suiPage.$("textarea[data-testid='address-input']");
  if (amount == Infinity) {
    await sleep(5000);
    try {
      await suiPage.waitForFunction(
        () => {
          const buttons = Array.from(
            document.querySelectorAll("button[type='button']")
          );
          const button = buttons.find((el) => el.innerText === "MAX");
          return !button.disabled;
        },
        { timeout: 15000 }
      );
    } catch (error) {
      console.log(error);
      suiPage.close();
      scriptLog("看起来这个钱包没钱");
      return;
    }
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
// 断开连接
export async function disconnect(browser, name) {
  const suiPage = await browser.newPage();
  await suiPage.goto(
    "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/apps/connected",
    { waitUntil: "networkidle0" }
  );
  const btn = await findElementByTypeAndText(
    suiPage,
    name,
    "div[role='button']"
  );
  // 滚动到元素位置,防止不在视口内点击无效
  if (btn) {
    // 使用 page.evaluate 来执行 JavaScript 滚动操作
    await suiPage.evaluate((element) => {
      element.scrollIntoView({ block: "center" });
    }, btn);
    await btn.click();
    await sleep(1000);
    const disconnect = await findElementByTypeAndText(
      suiPage,
      "Disconnect",
      "button"
    );
    await disconnect.click();
    await sleep(500);
  } else {
    scriptLog("动作: 断开连接, 问题: 未找到对应元素");
  }
  await suiPage.close();
}
//切换账号
export async function switchAccount(browser, idx) {
  const suiPage = await browser.newPage();
  await suiPage.goto(
    "chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#/tokens",
    { waitUntil: "networkidle0" }
  );
  await suiPage.waitForSelector("button[data-headlessui-state='']", {
    timeout: 15000,
  });
  let btn = await suiPage.$("button[data-headlessui-state='']");
  await btn.click();
  await sleep(300);
  let addressList = await suiPage.$$("ul li >button.appearance-none");
  await scrollIntoView(suiPage, addressList[idx]);
  await addressList[idx].click();
  await sleep(1000);
  suiPage.close();
}

// 查找钱包弹窗
export async function findSuiPage(browser, type, maxAttempts = 5) {
  const typeList = {
    approval: "/dapp/approve",
    connect: "/dapp/connect",
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const targets = await browser.targets();

    const approval = targets
      .reverse()
      .find((v) =>
        v
          .url()
          .includes(
            `chrome-extension://opcgpfmipidbgpenhmajoajpbobppdil/ui.html#${typeList[type]}`
          )
      );

    if (approval) {
      return approval; // 找到目标，返回它
    }

    // 如果未找到，等待1秒后继续下一次查找
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 达到最大尝试次数，仍未找到目标，可以选择抛出异常或返回 null
  console.error(`Unable to find target after ${maxAttempts} attempts.`);
  return null;
}
// 授权
export async function auth(browser) {
  const approval = await findSuiPage(browser, "approval", 30);
  if (approval) {
    const page = await approval.page();
    await page.waitForFunction(
      () => {
        const button = Array.from(document.querySelectorAll("button"));
        return button.some((el) => el.innerText == "Approve");
      },
      { timeout: 60000 }
    );
    const btn = await findElementByTypeAndText(page, "Approve", "button");
    await btn.click();
    await sleep(1000);
    const mayFail = await findElementByTypeAndText(
      page,
      "This transaction might fail. Are you sure you still want to approve the transaction?",
      "div"
    );
    if (mayFail) {
      await sleep(1000);
      page.close();
      throw new Error("交易可能失败");
    }
  }
}
// 连接
export async function connect(browser) {
  const approval = await findSuiPage(browser, "connect");
  if (approval) {
    const approvalPage = await approval.page();
    const connectBtn = await findElementByTypeAndText(
      approvalPage,
      "Connect",
      "button"
    );
    await connectBtn.click();
    await sleep(500);
  }else{
    throw new Error("连接失败")
  }
}
