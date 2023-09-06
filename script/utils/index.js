import { BrowserWindow } from "electron";
export function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
/**
 * 在指定页面中查找包含指定文本的元素。
 * @param {Page} page - Puppeteer 页面对象
 * @param {string} textToFind - 要查找的文本内容
 * @param {string} [elementType='*'] - 要查找的元素类型，可选，默认为所有元素
 * @returns {ElementHandle|null} - 如果找到匹配的元素，则返回该元素，否则返回 null
 */
export async function findElementByTypeAndText(
  page,
  textToFind,
  elementType = "*"
) {
  try {
    // 使用 page.$$() 查找指定类型的所有元素或所有元素
    const elements = await page.$$(elementType);

    // 遍历元素列表，检查文本内容是否包含指定文本
    for (const element of elements) {
      const elementText = await element.evaluate((node) => node.textContent);
      if (elementText.includes(textToFind)) {
        return element; // 如果找到匹配的元素，返回该元素
      }
    }
    return null; // 如果未找到匹配的元素，返回 null
  } catch (error) {
    console.error("查找元素时发生错误:", error);
    return null;
  }
}
// 在某个事件处理函数中获取当前窗口实例
export function getCurrentWindow() {
  const currentWindow = BrowserWindow.getFocusedWindow();
  const _currentWindow = BrowserWindow.getAllWindows()[0];
  if (currentWindow || _currentWindow) {
    return currentWindow || _currentWindow;
  } else {
    console.log("No focused window found.");
    return null;
  }
}
