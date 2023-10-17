import { getCurrentWindow } from "./index";

export function scriptLog() {
  const win = getCurrentWindow();
  console.log(...arguments)
  win.webContents.send("script-log", ...arguments);
}
