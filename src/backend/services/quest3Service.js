import db from "@/db"
import dayjs from "dayjs"
import { getHistory, getGame, contract } from "@/api/quest3"
import { sleep } from "@/utils"
import { scriptLog } from "@/utils/log"
import { batchAdd } from './suiRankService'
let stop = false
let stopPlayerFlag = false
export const startWatch = async () => {
  await getHistoryLoop()
  stop = false
}
export const stopWatch = () => {
  stop = true
}
export const stopPlayer = () => {
  stopPlayerFlag = true
}
const getHistoryLoop = async () => {
  try {
    const res = await getHistory()
    await handleHistory(res)
  } catch (error) {
    scriptLog(error)
  }
  if (stop) return
  await sleepHanleStop(60000)
  await getHistoryLoop()
}

const sleepHanleStop = async (time) => {
  if (time <= 0) return
  await sleep(1000)
  if (stop) return
  await sleepHanleStop(time - 1000)
}
const sleepHanleStopPlayer = async (time) => {
  if (time <= 0) return
  await sleep(1000)
  if (stopPlayerFlag) return
  await sleepHanleStopPlayer(time - 1000)
}

const handleHistory = async (res) => {
  // console.log(res.data.result)
  if (!res || !res.data || !res.data.result) return
  const arr = res.data.result.reverse()
  for (let i = 0; i < arr.length; i++) {
    const thisOne = arr[i]
    const lastOne = arr[i - 1]
    let historyRecord = await db.sui_lette.findOne({ type: "history_record" })
    historyRecord = historyRecord || { type: "history_record", data: [] }
    const one = historyRecord.data.find((v) => v.id === thisOne.id)
    if (!one) {
      historyRecord.data.unshift({
        ...thisOne,
        lastId: lastOne?.id || null,
        createTime: new Date().getTime(),
        createTimeStr: dayjs().format("MM-DD HH:mm:ss"),
      })
      console.log(historyRecord.data)
      await db.sui_lette.update(
        { type: "history_record" },
        { $set: { data: historyRecord.data } },
        {
          upsert: true,
        }
      )
    }
  }
}

export const getHistoryRecord = async () => {
  const historyRecord = await db.sui_lette.findOne({ type: "history_record" })
  return historyRecord?.data || []
}

export const startCatchPlayer = async () => {
  await getPlayerLoop()
  stopPlayer = false
}

const getPlayerLoop = async () => {
  try {
    const addressList = await getPlayer()
    console.log(addressList)
    batchAdd(addressList)
  } catch (error) {
    scriptLog(error)
  }
  if (stopPlayerFlag) return
  await sleepHanleStopPlayer(20000)
  return await getPlayerLoop() 
}

const getPlayer = async () => {
  let id = 0
  const gameData = await getGame()
  const game_object_id = gameData.data.result.game_object_id
  const objectsData = await contract({
    jsonrpc: "2.0",
    id,
    method: "sui_getObject",
    params: [
      game_object_id,
      {
        showContent: true,
      },
    ],
  })
  id++
  const objectId = objectsData.data.result.data.content.fields.bets.fields.contents.fields.id.id
  const dynamicData = await contract({
    jsonrpc: "2.0",
    id,
    method: "suix_getDynamicFields",
    params: [objectId, null, null],
  })
  id++
  const objects = dynamicData.data.result.data.map((v) => v.objectId)
  const addressData = await contract({
    jsonrpc: "2.0",
    id,
    method: "sui_multiGetObjects",
    params: [
      objects,
      {
        showContent: true,
      },
    ],
  })
  id++
  const addressList = addressData.data.result.map((v) => v.data.content.fields.value.fields.player)
  return Array.from(new Set(addressList))
}
