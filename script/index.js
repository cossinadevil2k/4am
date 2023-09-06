import { ipcMain } from "electron";
import suiQuest2 from "./suiQuest2";
import exportWallet from "./exportWallet";
import sendToChild from "./sendToChild";
import sendToFather from "./sendToFather";

export default function () {
  ipcMain.on("sui-quest2", suiQuest2);
  ipcMain.on("export-wallet", exportWallet);
  ipcMain.on("send-to-child", sendToChild);
  ipcMain.on("send-to-father", sendToFather);
}
