import db from "@/db"
import dayjs from "dayjs"
import { getRank, getSUINS } from "@/api/quest3"
import { scriptLog } from "@/utils/log"
import { dialog } from "electron"
import fs from "fs"

export const batchAdd = async (addressList) => {
  let count = 0
  for (let address of addressList) {
    try {
      await addAccount(address, null, true)
      count++
    } catch (error) {
      console.log(error)
    }
  }
  scriptLog(`抓到${count}个赌狗`)
}

export const addAccount = async (address, remark, dontGetRank = false) => {
  const res = await db.sui_quest.findOne({ address })
  const newAddress = { address, remark, created_at: new Date().getTime(), updated_at: new Date().getTime() }
  let rankData = null
  if (res) {
    throw new Error("address already exists")
  }
  if (!dontGetRank) {
    try {
      const rank = await getRank(address)
      rankData = rank?.data?.[0]?.result?.data || null
      newAddress.score = rankData.score
      newAddress.rank = rankData.rank
      const suins = await getSUINS(address)
      // console.log(rank?.data)
      console.log(suins.data)
      newAddress.suins = suins?.data?.result?.data?.[0] || ""
    } catch (error) {
      console.log(error)
    }
  }
  return await db.sui_quest.insert({ ...newAddress, rankData })
}
export const getAccountById = async (id) => {
  const account = await db.sui_quest.findOne({ _id: id })
  return formatAccount(account)
}
export const getAccountByEmail = async (email) => {
  const account = await db.sui_quest.findOne({ email })
  return formatAccount(account)
}

export const updateAccount = async (id, remark) => {
  const updatedEmail = { remark, updated_at: new Date() }
  await db.sui_quest.update({ _id: id }, { $set: updatedEmail })
}
export const updateRank = async (id) => {
  const account = await db.sui_quest.findOne({ _id: id })
  let rankData = account.rankData
  let suins = account.suins
  try {
    const rank = await getRank(account.address)
    rankData = rank?.data?.[0]?.result?.data || null
    const suinsData = await getSUINS(account.address)
    scriptLog(rank?.data)
    scriptLog(suinsData?.data)
    suins = suinsData?.data?.result?.data?.[0] || ""
  } catch (error) {
    console.log(error)
  }
  await db.sui_quest.update({ _id: id }, { $set: { rankData, suins, updated_at: new Date().getTime(), score: rankData?.score, rank: rankData?.rank } })
  const newAccount = await db.sui_quest.findOne({ _id: id })
  return newAccount
}
export const deleteAccount = async (ids) => {
  const result = await db.sui_quest.remove({ _id: { $in: ids } }, { multi: true })
  return result
}

export const getAccounts = async ({ currentPage = 1, pageSize = 20, query = {}, sort = { score: -1 } }) => {
  const list = await db.sui_quest
    .find(query)
    .sort(sort)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .exec()

  const formattedList = list.map((item) => {
    return formatAccount(item)
  })

  const total = await db.sui_quest.count()
  return { list: formattedList, pageInfo: { currentPage, pageSize, total } }
}
const formatTime = (timeStmp, fmt = "MM-DD HH:mm") => {
  if (!timeStmp) return ""
  return dayjs(timeStmp).format(fmt)
}

const formatAccount = (account) => {
  const { _id, status, created_at, updated_at, ...rest } = account
  return {
    id: _id, // 将 _id 重命名为 id
    created_at: formatTime(created_at),
    updated_at: formatTime(updated_at),
    ...rest,
  }
}
export const exportDb = async () => {
  try {
    const suiData = await db.sui_quest.find({})

    const allData = {
      sui_quest: suiData,
    }
    const defaultFileName = `4am-db-suiRank-${dayjs().format("YYMMDDHHmmss")}.json`
    const options = {
      title: "Save Database Backup",
      defaultPath: defaultFileName,
      filters: [{ name: "JSON", extensions: ["json"] }],
    }
    const { filePath } = await dialog.showSaveDialog(options)
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(allData, null, 2))
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    throw new Error("An error occurred while exporting data.")
  }
}
// 从文件导入数据库数据
export const importDb = async () => {
  try {
    const filePaths = dialog.showOpenDialogSync({
      filters: [{ name: "JSON", extensions: ["json"] }],
      properties: ["openFile"],
    })

    if (filePaths && filePaths.length > 0) {
      const data = JSON.parse(fs.readFileSync(filePaths[0], "utf8"))
      for (let v of data.sui_quest) {
        const account = await db.sui_quest.find({ address: v.address })
        if (account) return
        await db.sui_quest.insert(v)
      }
      console.log("Database imported successfully.")
    }
  } catch (error) {
    console.error("Error importing database:", error)
    throw new Error(`Error importing database: ${error}`)
  }
}
