// GmailService.mjs
import { promises as fs } from "fs"
import path from "path"
import { google } from "googleapis"
import { authenticate } from "@/modules/@google-cloud/local-auth"
import { app } from "electron"
import atob from "atob"
const userDataPath = app.getPath("userData")

export default class GmailService {
  constructor(email, timeout = 5000) {
    this.email = email
    this.timeout = timeout
    this.SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
    this.TOKEN_PATH = path.join(userDataPath, "PersistentData/gmail/token", `${this.email}.json`)
    this.CREDENTIALS_PATH = path.join(userDataPath, "PersistentData/gmail/credential", `${this.email}.json`)
    console.log(this.TOKEN_PATH, this.CREDENTIALS_PATH)
  }

  // 添加一个超时方法
  async withTimeout(promise) {
    return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), this.timeout))])
  }

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(this.TOKEN_PATH)
      const credentials = JSON.parse(content)
      return google.auth.fromJSON(credentials)
    } catch (err) {
      console.log(err)
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
    })
    await fs.writeFile(this.TOKEN_PATH, payload)
  }

  async authorize() {
    let client = await this.loadSavedCredentialsIfExist()
    if (client) {
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

  async getMails(query = {}, decode = false) {
    const auth = await this.authorize()
    const gmail = google.gmail({ version: "v1", auth })
    console.log("获取邮件列表")
    // 使用 withTimeout 包装异步操作
    const res = await this.withTimeout(
      gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
        ...query,
      })
    )
    console.log("获取邮件列表成功")
    const messages = res.data.messages || []
    const result = []
    for (const message of messages) {
      console.log("获取邮件详情")
      const messageInfo = await this.withTimeout(
        gmail.users.messages.get({
          userId: "me",
          id: message.id,
        })
      )
      console.log("格式化邮件内容")
      const details = this.mailParser(messageInfo, decode)
      result.push({
        id: message.id,
        ...details,
      })
    }
    return result
  }

  async getEmailContent(messageId) {
    const auth = await this.authorize()
    const gmail = google.gmail({ version: "v1", auth })
    return await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    })
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
