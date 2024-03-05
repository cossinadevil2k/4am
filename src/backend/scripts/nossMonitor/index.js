import { scriptLog } from "../../utils/log"
import axios from "axios"
async function main(stopEvent, { setting }) {
  const { nossAddr1, nossAddr2, nossAddr3, nossAddr4, nossAddr5, monitorTime = 20 * 60 * 1000 } = setting
  const nossAddrList = [nossAddr1, nossAddr2, nossAddr3, nossAddr4, nossAddr5].filter((v) => v).map((v) => ({ address: v, balance: 0 }))
  if (!nossAddrList.length) {
    scriptLog("未传入地址")
    return
  }
  scriptLog(`开始监控   间隔: ${monitorTime}ms  地址: \r\n [ ${nossAddrList.map((v) => v.address).join(` ]\r\n[ `)} ]`)
  monitorNoss()
  setInterval(() => {
    monitorNoss()
  }, Number(monitorTime))
  async function monitorNoss() {
    scriptLog("-------分割线--------")
    nossAddrList.forEach((v) => {
      axios
        .get(`https://api-worker.noscription.org/indexer/balance?npub=${v.address}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": "Windows",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": 1,
          },
        })
        .then((res) => {
          scriptLog(`地址: ${v.address}          余额: ${res.data[0].balance}          增加: ${res.data[0].balance - v.balance}`)
          v.balance = res.data[0].balance
        })
        .catch((err) => {
          scriptLog(err)
          scriptLog(`地址: ${v.address}          余额查询失败`)
        })
    })
  }
}
export default main
