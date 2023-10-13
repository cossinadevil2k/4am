import * as quest3Service from "@/services/quest3Service"
import * as responseCodes from "@/constants/responseCodes"

export const watchHistory = async (req, res) => {
  await quest3Service.startWatch()
  res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
}
export const stopWatch = async (req, res) => {
  await quest3Service.stopWatch()
  res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
}
export const getHistoryRecord = async (req, res) => {
  const data = await quest3Service.getHistoryRecord()
  res.json({ code: responseCodes.SUCCESS, message: "success", data })
}
