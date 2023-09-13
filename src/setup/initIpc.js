import { ipcMain } from "electron"
import suiQuest2 from "@/scripts/suiQuest2"
import exportWallet from "@/scripts/exportWallet"
import sendToChild from "@/scripts/sendToChild"
import sendToFather from "@/scripts/sendToFather"
import sui2 from "@/scripts/sui2"
import overWallet from "@/scripts/OverWallet"

export default function () {
  ipcMain.on("sui-quest2", suiQuest2)
  ipcMain.on("export-wallet", exportWallet)
  ipcMain.on("send-to-child", sendToChild)
  ipcMain.on("send-to-father", sendToFather)
  ipcMain.on("sui2", sui2)
  ipcMain.on("over-wallet", overWallet)
}
