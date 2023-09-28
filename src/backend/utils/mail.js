import axios from "axios"
import { SocksProxyAgent } from "socks-proxy-agent"
import { promises as fs } from "fs"
import path from "path"
import { google } from "googleapis"
import { authenticate } from "@/modules/@google-cloud/local-auth"
import { app } from "electron"
import atob from "atob"
import { scriptLog } from "./log"
const userDataPath = app.getPath("userData")

export default class GmailService {
  constructor(email, proxy = null, timeout = 15000) {
    this.email = email
    this.timeout = timeout
    this.SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
    this.TOKEN_PATH = path.join(userDataPath, "PersistentData/gmail/token", `${this.email}.json`)
    this.CREDENTIALS_PATH = path.join(userDataPath, "PersistentData/gmail/credential", `${this.email}.json`)
    this.access_token = ""
    this.expires_at = ""
    this.proxyOptions = proxy
  }

  // async withTimeout(promise) {
  //   return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), this.timeout))])
  // }

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(this.TOKEN_PATH)
      const credentials = JSON.parse(content)
      this.access_token = credentials.access_token
      this.expires_at = credentials.expires_at
      return google.auth.fromJSON(credentials)
    } catch (err) {
      scriptLog(err)
      return null
    }
  }

  async saveCredentials(client) {
    const content = await fs.readFile(this.CREDENTIALS_PATH)
    const keys = JSON.parse(content)
    const key = keys.installed || keys.web
    const payload = JSON.stringify({
      type: "authorized_user",
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
      access_token: client.credentials.access_token, // 保存 access_token
      expires_at: client.credentials.expiry_date, // 保存过期时间
    })
    this.access_token = client.credentials.access_token
    this.expires_at = client.credentials.expiry_date
    await fs.writeFile(this.TOKEN_PATH, payload)
  }

  async authorize() {
    let client = await this.loadSavedCredentialsIfExist()
    scriptLog(this.access_token)
    scriptLog(this.expires_at)
    if (client) {
      if (this.isTokenExpired()) {
        scriptLog("token过期或不存在,刷新token")
        // 只有当access_token不存在或已过期时，才刷新它
        await client.refreshAccessToken()
        await this.saveCredentials(client) // 如果刷新了 token，则保存它
      }
      return client
    }
    client = await authenticate({
      scopes: this.SCOPES,
      keyfilePath: this.CREDENTIALS_PATH,
    })
    if (client.credentials) {
      await this.saveCredentials(client)
    }
    return client
  }
  isTokenExpired() {
    return !this.access_token || new Date().getTime() >= this.expires_at + 1000
  }
  createAxiosInstance(accessToken) {
    const http = axios.create({
      baseURL: "https://www.googleapis.com/gmail/v1/users/me/",
      timeout: this.timeout,
      headers: { Authorization: `Bearer ${accessToken}` },
      maxContentLength: 30 * 1024 * 1024,
    })
    if (this.proxyOptions) {
      scriptLog("使用代理：", this.proxyOptions)
      http.defaults.httpsAgent = new SocksProxyAgent(`socks5://${this.proxyOptions.userId}:${this.proxyOptions.password}@${this.proxyOptions.host}:${this.proxyOptions.port}`)
      http.interceptors.response.use((response) => {
        scriptLog("Response received from proxy:", response.config.httpsAgent.proxy)
        return response
      })
    }
    return http
  }

  async getMails(query = {}, decode = false) {
    await this.authorize()
    const accessToken = this.access_token
    const axiosInstance = this.createAxiosInstance(accessToken)

    scriptLog("获取邮件列表")
    const res = await axiosInstance.get("messages", {
      params: {
        maxResults: 10,
        ...query,
      },
    })
    scriptLog("获取邮件列表成功")

    const messages = res.data.messages || []
    const result = []

    for (const message of messages) {
      scriptLog("获取邮件详情")
      const messageInfo = await axiosInstance.get(`messages/${message.id}`)
      scriptLog("格式化邮件内容")
      const details = this.mailParser(messageInfo, decode)
      result.push({
        id: message.id,
        ...details,
      })
    }
    return result
  }

  async checkCredentialsAndTokenExist() {
    const credentialsExist = await fs
      .access(this.CREDENTIALS_PATH)
      .then(() => true)
      .catch(() => false)
    const tokenExist = await fs
      .access(this.TOKEN_PATH)
      .then(() => true)
      .catch(() => false)
    return { credentialsExist, tokenExist }
  }
  mailParser = (messageInfo, decode) => {
    const headers = messageInfo.data.payload.headers || []
    const snippet = messageInfo.data.snippet
    const from = headers.find((header) => header.name === "From").value
    const to = headers.find((header) => header.name === "To").value
    const subject = headers.find((header) => header.name === "Subject").value
    const date = headers.find((header) => header.name === "Date").value
    let decodedText = null,
      decodedHtml = null
    if (decode) {
      const parts = messageInfo.data.payload.parts
      const textPart = parts.find((part) => part.mimeType === "text/plain")
      const htmlPart = parts.find((part) => part.mimeType === "text/html")

      const textBody = textPart ? textPart.body.data : null // 这里的 data 可能是 Base64 编码的
      const htmlBody = htmlPart ? htmlPart.body.data : null // 这里的 data 可能是 Base64 编码的

      decodedText = atob(textBody) // 使用 atob 函数进行 Base64 解码
      decodedHtml = atob(htmlBody) // 使用 atob 函数进行 Base64 解码
    }

    return {
      from,
      to,
      subject,
      decodedText,
      decodedHtml,
      snippet,
      date,
    }
  }
}
