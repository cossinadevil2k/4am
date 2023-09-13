// GmailService.mjs
import { promises as fs } from "fs"
import path from "path"
import { google } from "googleapis"
import { authenticate } from "@google-cloud/local-auth"
import { app } from 'electron';
const userDataPath = app.getPath('userData');

export default class GmailService {
  constructor(email) {
    this.email = email
    this.SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
    this.TOKEN_PATH = path.join(userDataPath, `${this.email}-token.json`)
    this.CREDENTIALS_PATH = path.join(userDataPath, `${this.email}-credentials.json`)
    console.log(this.TOKEN_PATH, this.CREDENTIALS_PATH)
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
      await client.refreshAccessToken()
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

  async listEmails(query) {
    const auth = await this.authorize()
    const gmail = google.gmail({ version: "v1", auth })
    return await gmail.users.messages.list({
      userId: "me",
      q: query,
    })
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
}
