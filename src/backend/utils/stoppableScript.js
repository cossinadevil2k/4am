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

  async _runScript(params) {
    try {
      await this.scriptFunction(this.stopSignal, params)
    } catch (error) {
      console.error("An error occurred:", error)
    }
  }

  async run(params) {
    // 监听停止信号
    this.stopSignal.once("stop", () => {
      throw new Error("Script was stopped")
    })
    await this._runScript(params)
  }

  stop() {
    this.stopSignal.emit("stop")
  }
}
