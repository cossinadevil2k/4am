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
  const res = await db.sui_quest.findOne({ address })
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

export const updateAccount = async (id, remark, bgColor) => {
  const updatedEmail = { remark, bgColor }
  await db.sui_quest.update({ _id: id }, { $set: updatedEmail })
}
export const updateRank = async (id) => {
  const account = await db.sui_quest.findOne({ _id: id })
  await _updateRank(account)
  return await db.sui_quest.findOne({ _id: id })
}
const _updateRank = async (account) => {
  let rankData = account.rankData
  let suins = account.suins
  let updated_at = account.updated_at
  let historyRankData = account.historyRankData
  try {
    const rank = await getRank(account.address)
    const rankDetail = rank?.data?.[0]?.result?.data || null
    if (rankDetail) {
      if (rankData && rankData.update_at && dayjs.utc().isAfter(dayjs.utc(rankData.update_at).subtract(1, "hour"), "day")) {
        historyRankData = account.rankData
      }
      rankData = {
        ...rankDetail.metadata,
        bot: rankDetail.bot,
        rank: rankDetail.rank,
        reward: rankDetail.reward,
        score: rankDetail.score,
        update_at: new Date().getTime(),
        updated_at_str: formatTime(new Date().getTime()),
      }

      updated_at = new Date().getTime()
      scriptLog(
        `更新${account.address.replace(account.address.slice(8, -4), "**")}成功，更新前分数：${account.score}, 更新后分数：${rankData?.score}, 更新前排名: ${account.rank}, 更新后排名： ${
          rankData?.rank
        }`
      )
    } else {
      scriptLog(`更新${account.address}失败`)
    }
    const suinsData = await getSUINS(account.address)
    suins = suinsData?.data?.result?.data?.[0] || ""
  } catch (error) {
    console.log(error)
    scriptLog(`更新${account.address}失败`)
  }
  await db.sui_quest.update({ _id: account._id }, { $set: { rankData, historyRankData, suins, updated_at, score: rankData?.score, rank: rankData?.rank } })
}
export const updateRankAll = async () => {
  scriptLog(`开始全量更新,共${index}条...`)
  const accounts = await db.sui_quest.find({})
  const maxConcurrentRequests = 5 // 同时运行的最大请求数量
  let activeRequests = 0 // 当前活跃的请求数量
  let index = 0 // 当前处理到的数组索引

  const handleRequest = async (account) => {
    try {
      account.loading = true
      await _updateRank(account)
    } catch (error) {
      console.log(error)
    } finally {
      account.loading = false
      activeRequests-- // 完成一个请求后，活跃请求数量减1
    }
  }

  const loop = async () => {
    while (index < accounts.length) {
      if (activeRequests < maxConcurrentRequests) {
        activeRequests++
        scriptLog(`开始更新第${index + 1}条, 剩余${accounts.length - index - 1}条`)
        handleRequest(accounts[index])
        index++
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100)) // 等待一下再检查
      }
    }
  }

  await loop()

  // 等待所有请求完成
  while (activeRequests > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  scriptLog(`${index}条数据更新完成`)
}
export const deleteAccount = async (ids) => {
  const result = await db.sui_quest.remove({ _id: { $in: ids } }, { multi: true })
  return result
}

export const getAccounts = async ({ currentPage, pageSize, query, sort = { score: -1 } }) => {
  const { list, pageInfo } = await $page({
    db: db.sui_quest,
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
const formatTime = (timeStmp, fmt = "MM/DD/HH:mm") => {
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
        const account = await db.sui_quest.findOne({ address: v.address })
        if (account) continue
        console.log(v)
        await db.sui_quest.insert(v)
      }
      console.log("Database imported successfully.")
    }
  } catch (error) {
    console.error("Error importing database:", error)
    throw new Error(`Error importing database: ${error}`)
  }
}
