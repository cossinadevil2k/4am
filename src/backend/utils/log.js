import { getCurrentWindow } from "./index";

export function scriptLog(log) {
  const win = getCurrentWindow();
  win.webContents.send("script-log", log);
}
