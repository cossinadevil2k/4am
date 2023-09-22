import db from "@/db"
import { EMAIL_STATUS_CONST } from "SHARE/email"
import dayjs from "dayjs"
import Mail from "@/utils/mail"
import { app } from "electron"
import path from "path"
import { scriptLog } from '@/utils/log'
const { exec } = require('child_process');

export const addEmail = async (name, email, remark) => {
  const res = await db.email.findOne({ email })
  if (res) {
    throw new Error("Email already exists")
  }
  const status = await checkMailStatus(email)
  const newEmail = { name, email, remark, status, created_at: new Date().getTime(), updated_at: new Date().getTime() }
  return await db.email.insert(newEmail)
}
export const bacthImportEmails = async (emails) => {
  const importResults = {
    successCount: 0,
    duplicateCount: 0,
    duplicateEmails: [],
  }
  let count = await getEmailCount()

  const insertPromises = emails.map(async (email) => {
    // 检查是否已存在相同的email地址
    const res = await db.email.findOne({ email })

    // 如果已存在相同email，则记录下来并增加重复计数
    if (res) {
      importResults.duplicateCount++
      importResults.duplicateEmails.push(email)
      return // 不进行插入操作
    }
    const status = await checkMailStatus(email)
    // 构建新的email对象
    const newEmail = {
      name: `邮箱 ${++count}`,
      email,
      remark: "",
      status,
      created_at: new Date().getTime() + count,
      updated_at: new Date().getTime() + count,
    }

    // 执行新增操作
    await db.email.insert(newEmail)
    importResults.successCount++
  })

  // 使用Promise.all等待所有操作完成
  await Promise.all(insertPromises)

  return importResults
}
export const getEmailById = async (id) => {
  return await db.email.findOne({ _id: id })
}

export const updateEmail = async (id, rest) => {
  const updatedEmail = { ...rest, updated_at: new Date().getTime() }
  await db.email.update({ _id: id }, { $set: updatedEmail })
}

export const deleteEmails = async (ids) => {
  const result = await db.email.remove({ _id: { $in: ids } }, { multi: true })
  return result
}

export const getEmails = async ({ currentPage = 1, pageSize = 20, query = {}}) => {
  const list = await db.email
    .find(query)
    .sort({ created_at: 1, name: 1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .exec()
  const formattedList = list.map((item) => {
    const { _id, created_at, updated_at, ...rest } = item
    return {
      id: _id, // 将 _id 重命名为 id
      created_at: dayjs(created_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
      updated_at: dayjs(updated_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
      ...rest,
    }
  })

  const total = await db.email.count()
  return { list: formattedList, pageInfo: { currentPage, pageSize, total } }
}
export const getEmailCount = async () => {
  return await db.email.count()
}

export const check = async (id) => {
  const email = await db.email.findOne({ _id: id })
  const status = await checkMailStatus(email.email)
  await db.email.update({ _id: id }, { $set: { status } })
  return null
}

export const checkMailStatus = async (email) => {
  const mail = new Mail(email)
  const { credentialsExist, tokenExist } = await mail.checkCredentialsAndTokenExist()
  scriptLog({ credentialsExist, tokenExist })
  return tokenExist ? EMAIL_STATUS_CONST.TOKEN : credentialsExist ? EMAIL_STATUS_CONST.CREDENTIALS : EMAIL_STATUS_CONST.CREATED
}

export const getToken = async (email) => {
  const mail = new Mail(email)
  const client = await mail.authorize()
  if (client) {
    await db.email.update({ email }, { $set: { status: EMAIL_STATUS_CONST.TOKEN } })
    return true
  }
}
export const getMails = async (id) => {
  const email = await db.email.findOne({ _id: id })
  let proxy = null
  if (email.proxy_host && email.proxy_port) {
    proxy = {
      host: email.proxy_host,
      port: email.proxy_port,
      userId: email.proxy_username,
      password: email.proxy_password,
    }
  }
  const mail = new Mail(email.email, proxy)
  const mails = await mail.getMails({ maxResults: 10 })
  return mails
}

export const openApikeyDir = async () => {
  const folderPath = path.join(app.getPath("userData"), "PersistentData/gmail/credential")
  exec(`start ${folderPath}`, (err) => {
    if (err) {
      console.error(`无法打开文件夹: ${err}`);
    }
  });
}
