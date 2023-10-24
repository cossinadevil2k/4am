import db from "@/db"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { getRank, getSUINS } from "@/api/quest3"
import { scriptLog } from "@/utils/log"
import { dialog } from "electron"
import fs from "fs"
import { $page } from "@/utils/curd"
dayjs.extend(utc)
export const batchImport = async (addressList, remark, bgColor) => {
  for (let address of addressList) {
    try {
      await addAccount(address, remark, bgColor, true)
    } catch (error) {
      console.log(error)
    }
  }
}

export const addAccount = async (address, remark, bgColor, dontGetRank = false) => {
  const res = await db.sui_quest_self.findOne({ address })
  const newAddress = { address, remark, bgColor, created_at: new Date().getTime(), updated_at: new Date().getTime() }
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
  return await db.sui_quest_self.insert({ ...newAddress, rankData })
}
export const getAccountById = async (id) => {
  const account = await db.sui_quest_self.findOne({ _id: id })
  return formatAccount(account)
}
export const getAccountByEmail = async (email) => {
  const account = await db.sui_quest_self.findOne({ email })
  return formatAccount(account)
}

export const updateAccount = async (id, remark, bgColor) => {
  const updatedEmail = { remark, bgColor }
  await db.sui_quest_self.update({ _id: id }, { $set: updatedEmail })
}
export const updateRank = async (id) => {
  const account = await db.sui_quest_self.findOne({ _id: id })
  let rankData = account.rankData
  let suins = account.suins
  let updated_at = account.updated_at
  let historyRankData = account.historyRankData
  try {
    const rank = await getRank(account.address)
    const rankDetail = rank?.data?.[0]?.result?.data || null
    if (rankDetail) {
      rankData = {
        ...rankDetail.metadata,
        bot: rankDetail.bot,
        rank: rankDetail.rank,
        reward: rankDetail.reward,
        score: rankDetail.score,
        update_at: new Date().getTime(),
        updated_at_str: formatTime(new Date().getTime())
      }
      console.log(dayjs.utc().format('MM-DD HH:mm'))
      console.log(dayjs.utc(rankData.update_at).format('MM-DD HH:mm'))
      console.log(dayjs.utc().isAfter(dayjs.utc(rankData.update_at), "day"))
      if (rankData && rankData.update_at && dayjs.utc().isAfter(dayjs.utc(rankData.update_at), "day")) {
        historyRankData = account.rankData
      }

      updated_at = new Date().getTime()
    }
    const suinsData = await getSUINS(account.address)
    scriptLog(rank?.data)
    scriptLog(suinsData?.data)
    suins = suinsData?.data?.result?.data?.[0] || ""
  } catch (error) {
    console.log(error)
  }
  await db.sui_quest_self.update({ _id: id }, { $set: { rankData, historyRankData, suins, updated_at, score: rankData?.score, rank: rankData?.rank } })
  const newAccount = await db.sui_quest_self.findOne({ _id: id })
  return newAccount
}
export const deleteAccount = async (ids) => {
  const result = await db.sui_quest_self.remove({ _id: { $in: ids } }, { multi: true })
  return result
}

export const getAccounts = async ({ currentPage, pageSize, query, sort = { created_at: 1 } }) => {
  const { list, pageInfo } = await $page({
    db: db.sui_quest_self,
    currentPage,
    pageSize,
    query,
    sort,
  })

  const formattedList = list.map((item) => {
    return formatAccount(item)
  })

  return { list: formattedList, pageInfo }
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
    const suiData = await db.sui_quest_self.find({})

    const allData = {
      sui_quest_self: suiData,
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
      for (let v of data.sui_quest_self) {
        const account = await db.sui_quest_self.findOne({ address: v.address })
        if (account) continue
        console.log(v)
        await db.sui_quest_self.insert(v)
      }
      console.log("Database imported successfully.")
    }
  } catch (error) {
    console.error("Error importing database:", error)
    throw new Error(`Error importing database: ${error}`)
  }
}
