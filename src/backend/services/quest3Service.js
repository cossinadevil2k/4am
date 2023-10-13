import db from "@/db"
import dayjs from "dayjs"
import { getHistory } from "@/api/quest3"
import { sleep } from "@/utils"
let stop = false
export const startWatch = async () => {
  await getHistoryLoop()
  stop = false
}
export const stopWatch = () => {
  stop = true
}
const getHistoryLoop = async () => {
  const res = await getHistory()
  await handleHistory(res)
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
