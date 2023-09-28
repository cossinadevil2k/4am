import { autoUpdater } from "electron-updater"
import logger from "electron-log"
import { dialog } from "electron"
export default function main() {
  autoUpdater.logger = logger
  autoUpdater.logger.transports.file.level = "info"
  autoUpdater.setFeedURL({
    provider: "github",
    owner: "cardamon-dk",
    repo: "4am",
    private: true,
    token: process.env.GH_TOKEN,
  })
  autoUpdater.autoDownload = false    
  autoUpdater.checkForUpdatesAndNotify()
  autoUpdater.on("download-progress", async (progress) => {
    logger.info(progress)
  })

  autoUpdater.on("update-available", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "更新可用",
        message: "检测到新版本，是否现在更新？",
        buttons: ["是", "稍后"],
      })
      .then((buttonIndex) => {
        if (buttonIndex.response === 0) {
          // 开始下载更新
          autoUpdater.downloadUpdate()
        }
      })
  })

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "更新下载完成",
        message: "更新已下载，应用将重启以完成更新。",
        buttons: ["立即重启", "稍后"],
      })
      .then((buttonIndex) => {
        if (buttonIndex.response === 0) {
          // 重启应用以应用更新
          autoUpdater.quitAndInstall()
        }
      })
  })
}
