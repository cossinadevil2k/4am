import axios from "axios"
import { SocksProxyAgent } from "socks-proxy-agent"
const baseURL = "https://x.metacene.io/cmd.php"

const commonHeaders = {
  'accept': 'application/json, text/plain, */*',
  'content-type': 'application/json',
  'origin': 'chrome-extension://igimfdmnnijclcfdgimooedbealfpndj',
  'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'none',
  'user-agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
};
const httpsAgent = null

export default class xMetaCeneApi {
  constructor({ proxy, cookie }) {
    this.proxy = proxy
    this.cookie = cookie
    this.setProxy()
    this.http = (options) => {
      return new Promise((resolve, reject) => {
        this.request(options)
          .then((res) => {
            resolve(res)
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
      })
    }
  }
  async request(data) {
    const options = {
      method: 'POST',
      headers: {
        ...commonHeaders,
        'cookie': `PHPSESSID=${this.cookie}`,
      },
      httpsAgent: this.httpsAgent,
      referrerPolicy: 'strict-origin-when-cross-origin',
      data: JSON.stringify(data),
      mode: 'cors',
      withCredentials: true,
    };

    const response = await axios(baseURL, options);
    if (response.data.code !== 0) {
      throw Error(response.data.msg)
    }
    console.log("Response received from proxy:", !!response.config.httpsAgent)
    // console.log(response.data);
    return response.data
  }
  setProxy(proxy) {
    this.proxy = this.proxy || proxy
    if (this.proxy) {
      // scriptLog("使用代理：", this.proxy)
      this.httpsAgent = new SocksProxyAgent(`socks5://${this.proxy.userId}:${this.proxy.password}@${this.proxy.host}:${this.proxy.port}`)
    }
  }
  async login() {
    return await this.http({ guide: { login: { code: "" } } });
  }

  async getTaskList(type) {
    return await this.http({ user: { getTaskList: { type } } });
  }

  async petLvUp() {
    return await this.http({ user: { petLvUp: {} } });
  }

  async roleLvUp(roleId) {
    return await this.http({ user: { roleLvUp: { role_id: roleId } } });
  }
  async getWakeUpStatus() {
    return await this.http({ user: { getWakeUpStatus: {} } })
  }
  async wakeUp() {
    return await this.http({ user: { wakePet: {} } })
  }
  async getWalletInitData() {
    return await this.http({ user: { getWalletInitData: {} } })
  }
  async walletCheckIn() {
    return await this.http({ user: { walletCheckIn: {} } })
  }
  async getTaskReward(id) {
    return await this.http({ user: { getTaskReward: { id } } })
  }
  async getBoxList(twid) {
    return await this.http({ user: { getBoxList: { twid: encodeURIComponent(`u=${twid}`) } } })
  }
  async monitor(boxid, twid) {
    return await this.http({ user: { monitor: { type: 1, boxid, text: "'xmetacene'", twid: encodeURIComponent(`u=${twid}`) } } })
  }
  async getTaskList(type = 0) {
    return await this.http({ user: { getTaskList: { type } } })
  }
  async recharge(spar) {
    return await this.http({ user: { recharge: { spar } } })
  }
  async getBossInfo() {
    return await this.http({ user: { getBossInfo: {} } })
  }
  async recover(spar) {
    return await this.http({ user: { recover: {} } })
  }
  async useEnergy(roleId) {
    return await this.http({ user: { useEnergy: { role_id: roleId, count: 1 } } })
  }
  async getLottoIndex() {
    return await this.http({ user: { getLottoIndex: { } } })
  }
  async getHdLog() {
    return await this.http({ user: { getHdLog: { } } })
  }
}
