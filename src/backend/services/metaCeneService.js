import db from "@/db"
import dayjs from "dayjs"
import { sleep } from "@/utils"
import { scriptLog } from "@/utils/log"
import XMetaCeneApi from "@/api/xMetaCeneApi"
const { metaCene: metaCeneDb } = db
export const addAccount = async (name, cookie, twid, remark, { proxy_host, proxy_port, proxy_username, proxy_password }) => {
  const res = await metaCeneDb.findOne({ name })
  const cookieExsit = await metaCeneDb.findOne({ cookie })
  const twidExsit = await metaCeneDb.findOne({ twid })
  if (res || cookieExsit || twidExsit) {
    throw new Error("name or cookie or twid already exists")
  }
  const newOne = { name, cookie, twid, remark, created_at: new Date().getTime(), updated_at: new Date().getTime(), proxy_host, proxy_port, proxy_username, proxy_password }
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(newOne, xMetaCeneApi)
  const data = await xMetaCeneApi.login()
  await metaCeneDb.insert({ ...newOne, ...updateGameData(data) })
}
export const getAccountById = async (id) => {
  const account = await metaCeneDb.findOne({ _id: id })
  return formatAccount(account)
}

export const updateAccount = async (id, name, remark, cookie, twid, { proxy_host, proxy_port, proxy_username, proxy_password }) => {
  const updatedEmail = { remark, name, cookie, twid, updated_at: new Date(), proxy_host, proxy_port, proxy_username, proxy_password }
  console.log(updatedEmail)
  await metaCeneDb.update({ _id: id }, { $set: updatedEmail })
}

export const deleteAccount = async (ids) => {
  const result = await metaCeneDb.remove({ _id: { $in: ids } }, { multi: true })
  return result
}

export const getAccounts = async ({ currentPage = 1, pageSize = 20, query = {}, sort = { created_at: -1 } }) => {
  const list = await metaCeneDb
    .find(query)
    .sort(sort)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .exec()

  const formattedList = list.map((item) => {
    return formatAccount(item)
  })
  const total = await metaCeneDb.count()
  return { list: formattedList, pageInfo: { currentPage, pageSize, total } }
}
const formatTime = (timeStmp, fmt = "YY-MM-DD HH:mm:ss") => {
  if (!timeStmp) return ""
  return dayjs(timeStmp).format(fmt)
}

const formatAccount = (account) => {
  const { _id, status, created_at, updated_at, last_claim_at, last_quiz_at, next_claim_available_from, ...rest } = account
  return {
    id: _id, // 将 _id 重命名为 id
    created_at: formatTime(created_at),
    updated_at: formatTime(updated_at),
    ...rest,
  }
}
export const getDetail = async ({ id, name }) => {
  let account = null
  if (id) {
    account = await metaCeneDb.findOne({ _id: id })
  } else {
    account = await metaCeneDb.findOne({ name })
  }
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  let data = null
  try {
    data = await xMetaCeneApi.login()
    await metaCeneDb.update({ _id: account._id }, { $set: updateGameData(data) })
  } catch (err) {
    scriptLog(`${account.name} 刷新错误 ${err}`)
    throw Error(err)
  }
  await xMetaCeneApi.getBossInfo().then(async res => {
    console.log(res)
    await metaCeneDb.update({ _id: account._id }, { $set: { bossInfo: res.data } })
  })
  try {
    await sleep(500)
    xMetaCeneApi.getTaskList(0).then(async res => {
      await metaCeneDb.update({ _id: account._id }, { $set: { tasklist: res.data } })
    })
    await sleep(500)
    xMetaCeneApi.getTaskList(1).then(async res => {
      await metaCeneDb.update({ _id: account._id }, { $set: { donetasklist: res.data } })
    })
    await sleep(500)
    xMetaCeneApi.getHdLog().then(async res => {
      await metaCeneDb.update({ _id: account._id }, { $set: { hdLog: res.data } })
    })
  } catch (error) {
    scriptLog(`获取任务失败：${error.msg}`)
  }
  return data
}
export const getSpar = async (id) => {
  let account = await metaCeneDb.findOne({ _id: id })
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  const data = await xMetaCeneApi.recover()
  if (!data.data.header) return data
  await metaCeneDb.update({ _id: id }, { $set: { spar: data.data.header.spar } })
  return data
}
export const doTask = async (id) => {
  let account = await metaCeneDb.findOne({ _id: id })
  if (!account.tasklist.length) return
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  for (let task of account.tasklist) {
    if (task.id === 5) {
      const res = await xMetaCeneApi.walletCheckIn()
      await sleep(5000)
      if (!res.data.status) {
        scriptLog(`${account.name} wallet checkin 任务失败`)
      }
      scriptLog(`${account.name} wallet checkin 成功`)
      const res2 = await xMetaCeneApi.getTaskReward(5)
      scriptLog(`${account.name} wallet checkin 领取成功`)
      scriptLog(res2)
      await metaCeneDb.update({ _id: id }, { $set: { spar: res2.data.header.spar, energy: res2.data.header.energy } })
    }
    if (task.id === 6) {
      if (!account.twid) return scriptLog(`${account.name} twid不存在`)
      const res = await xMetaCeneApi.getBoxList(account.twid)
      console.log(res.data)
      for (let box of res.data.box_list) {
        if (box.box_status) continue
        console.log(box)
        const res2 = await xMetaCeneApi.monitor(box.boxid, account.twid)
        await sleep(5000)
        console.log(res2)
        scriptLog(`${account.name} 宝箱${box.boxid} 领取成功 类型：${res2.data.name} 数量：${res2.data.count}`)
      }
    }
  }
}
const updateGameData = ({ data }) => {
  const { header, pet, roleWoman, roleMan } = data
  const newData = { ...header, speed: pet.all_speed, petLv: pet.lv, roleWomanLv: roleWoman.lv, roleManLv: roleMan.lv, gameData: data }
  return newData
}

export const roleLvUp = async (id, roleId) => {
  let account = await metaCeneDb.findOne({ _id: id })
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  const api = roleId === 3 ? 'petLvUp' : 'roleLvUp'
  const data = await xMetaCeneApi[api](roleId)
  if (roleId === 3) {
    data.data.roleMan = account.gameData.roleMan
    data.data.roleWoman = account.gameData.roleWoman
  } else {
    data.data.pet = account.gameData.pet
  }
  await metaCeneDb.update({ _id: id }, { $set: updateGameData(data) })
  // await getDetail(id)
}
export const wakeUp = async (id) => {
  let account = await metaCeneDb.findOne({ _id: id })
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  const data = await xMetaCeneApi.wakeUp()
  await metaCeneDb.update({ _id: id }, { $set: { petLv: data.data.pet.lv, gameData: { ...account.gameData, pet: data.data.pet } } })
}
export const charge = async (id) => {
  let account = await metaCeneDb.findOne({ _id: id })
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  const chargeAmount = Math.floor(account.spar * 0.9)
  const data = await xMetaCeneApi.recharge(chargeAmount)
  await metaCeneDb.update({ _id: id }, { $set: { bossInfo: { ...account.bossInfo, charged: account.bossInfo.charged + chargeAmount } } })
  return data
}

const setProxy = (account, api) => {
  if (account.proxy_host && account.proxy_port) {
    let proxy = {
      host: account.proxy_host,
      port: account.proxy_port,
      userId: account.proxy_username,
      password: account.proxy_password,
    }
    api.setProxy(proxy)
  }
}
export const useEnergy = async (id, roleId) => {
  let account = await metaCeneDb.findOne({ _id: id })
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  const data = await xMetaCeneApi.useEnergy(roleId)
  data.data.pet = account.gameData.pet
  await metaCeneDb.update({ _id: id }, { $set: updateGameData(data) })
} 
export const getLottoIndex = async (id) => {
  let account = await metaCeneDb.findOne({ _id: id })
  const { cookie } = account
  const xMetaCeneApi = new XMetaCeneApi({ cookie })
  setProxy(account, xMetaCeneApi)
  const data = await xMetaCeneApi.getLottoIndex()
  return data.data
} 