import { EventEmitter } from "events"

export default class StoppableScript {
  constructor(scriptFunction, restartInterval = 1000, maxRestartCount = 3) {
    this.scriptFunction = scriptFunction
    this.stopSignal = new EventEmitter()
    this.restartOnError = true
    this.restartInterval = restartInterval
    this.maxRestartCount = maxRestartCount
    this.currentRestartCount = 0
  }

  async _runScript() {
    try {
      await this.scriptFunction(this.stopSignal)
      this.currentRestartCount = 0 // 重置重启次数
    } catch (error) {
      console.error("An error occurred:", error)
      if (this.restartOnError && this.currentRestartCount < this.maxRestartCount) {
        console.log("Restarting script...")
        this.currentRestartCount++
        await new Promise((resolve) => setTimeout(resolve, this.restartInterval))
        this._runScript()
      }
    }
  }

  async run() {
    // 监听停止信号
    this.stopSignal.once("stop", () => {
      throw new Error("Script was stopped")
    })
    await this._runScript()
  }

  stop() {
    this.isStopped = true
    this.stopSignal.emit("stop")
  }
}
