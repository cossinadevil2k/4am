import { getCurrentWindow } from "./index";

export function scriptLog() {
  const win = getCurrentWindow();
  win.webContents.send("script-log", { ...arguments});
}
