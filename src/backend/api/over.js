import axios from "axios"
import { SocksProxyAgent } from "socks-proxy-agent"
import { scriptLog } from "../utils/log"
const baseURL = "https://mover-api-prod.over.network/"

export default class OverApi {
  constructor(proxy) {
    this.proxy = proxy
    this.request = axios.create({
      baseURL,
      timeout: 0,
      headers: {
        "User-Agent": "okhttp/4.9.2",
        "client-version": "1.0.6.51",
      },
    })
    this.setProxy()
    this.http = (options) => {
      return new Promise((resolve, reject) => {
        this.request(options)
          .then((res) => {
            const cookie = this.getCookies(res)
            this.setCookie(cookie)
            resolve({ res: res.data })
          })
          .catch((err) => {
            console.log(err)
            reject(err)
          })
      })
    }
  }
  setToken(token) {
    if (!token) return console.log("设置token失败,token为空")
    this.request.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }
  removeToken(){
    delete this.request.defaults.headers.common["Authorization"]
  }
  setProxy(proxy) {
    this.proxy = this.proxy || proxy
    if (this.proxy) {
      scriptLog("使用代理：", this.proxy)
      this.request.defaults.httpsAgent = new SocksProxyAgent(this.proxy)
      this.request.interceptors.response.use((response) => {
        console.log("Response received from proxy:", response.config.httpsAgent.proxy)
        return response
      })
    }
  }
  getCookies = (res) => {
    if (!res.headers["set-cookie"]) return ""
    return res.headers["set-cookie"].map((item) => item.split(";")[0]).join(";")
  }
  setCookie(cookie) {
    this.request.defaults.headers.common["Cookie"] = cookie
  }
  getVersion(data) {
    return this.http({
      method: "get",
      url: "/public/app-version/android",
      data,
    })
  }
  checkMail(data) {
    return this.http({
      method: "post",
      url: "/auth/check/email",
      data,
    })
  }

  //获取邮件
  getMail(data) {
    return this.http({
      method: "post",
      url: "/auth/request",
      data: {
        ...data,
        agreement: {
          agree_push_alert: true,
          agree_push_daily_reward: false,
          agree_marketing: true,
          agree_marketing_at: null,
          agree_push_marketing: true,
          agree_email_marketing: true,
          push_alert_permission: "granted",
        },
        language: "en",
      },
    })
  }

  //查询邮件验证状态
  getMailStatus(data) {
    return this.http({
      method: "post",
      url: "/auth/signin",
      data: {
        timezone: "Asia/Shanghai",
        language: "en",
        device_os: "android",
        ...data,
      },
    })
  }
  //登录
  signin() {
    return this.http({
      method: "get",
      url: "/user/signin",
    })
  }
  //刷新token
  refresh(data) {
    return this.http({
      method: "post",
      url: "/auth/refresh",
      data,
    })
  }
  //查分
  getPoint() {
    return this.http({
      method: "get",
      url: "/user",
    })
  }
  //查排名
  getRank() {
    return this.http({
      method: "get",
      url: "/reward",
    })
  }
  //领分
  claim() {
    return this.http({
      method: "post",
      url: "/daily/claim",
    })
  }
  //查询每日任务获取问题id
  missionInfo() {
    return this.http({
      method: "get",
      url: "/mission/3/info",
    })
  }
  //根据问题id查询问题内容
  quizStart(id) {
    return this.http({
      method: "get",
      url: `/mission/3/quiz/${id}/start`,
    })
  }
  //提交答案
  quizSubmit(id, data) {
    return this.http({
      method: "post",
      url: `/mission/3/quiz/${id}/submit`,
      data,
    })
  }
  //校验用户名
  checkUsername(name) {
    return this.http({
      method: "get",
      url: `/user/name/${name}`,
    })
  }
  //提交用户名
  setUsername(name) {
    return this.http({
      method: "post",
      url: `/user/name/${name}`,
    })
  }
  //校验邀请码
  checkInviteCode(invite_code) {
    return this.http({
      method: "get",
      url: `/user/invite_code/${invite_code}`,
    })
  }
  //提交邀请码
  setInviteCode(invite_code) {
    return this.http({
      method: "post",
      url: `/user/invite_code/${invite_code}`,
    })
  }
  //获取邀请奖励
  claimInvite() {
    return this.http({
      method: "post",
      url: `/user/claim/invite`,
    })
  }
  //获取初次注册的1000分
  claimFirstTimePoint() {
    return this.http({
      method: "post",
      url: `/event/1/click`,
      data: {},
    })
  }
}
