import * as suiRankService from "@/services/suiRankService"
import * as responseCodes from "@/constants/responseCodes"

export const createAccount = async (req, res) => {
  try {
    const { address, remark = "" } = req.body
    if (!address) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "address are required", data: null })
    }
    const emailRecord = await suiRankService.addAccount(address, remark)
    res.json({ code: responseCodes.SUCCESS, message: "address created successfully", data: emailRecord })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getAccount = async (req, res) => {
  const id = req.params.id
  const email = await suiRankService.getAccountById(id)
  if (!email) {
    return res.status(responseCodes.NOT_FOUND).json({ code: responseCodes.NOT_FOUND, message: "Email not found", data: null })
  }
  res.json({ code: responseCodes.SUCCESS, message: "Email fetched successfully", data: email })
}

export const updateAccount = async (req, res) => {
  const { id, remark } = req.body
  await suiRankService.updateAccount(id, remark)
  res.json({ code: responseCodes.SUCCESS, message: "Email updated successfully", data: null })
}

export const updateRank = async (req, res) => {
  const { id } = req.body
  const data = await suiRankService.updateRank(id)
  res.json({ code: responseCodes.SUCCESS, message: "updated successfully", data })
}
export const deleteAccount = async (req, res) => {
  const { ids } = req.body
  if (!ids || ids.length === 0) {
    return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "ids is required", data: null })
  }
  await suiRankService.deleteAccount(ids)
  res.json({ code: responseCodes.SUCCESS, message: "Email deleted successfully", data: null })
}
export const getAccountList = async (req, res) => {
  try {
    const { currentPage, pageSize } = req.query || {}
    console.log(req.query)
    const emailList = await suiRankService.getAccounts({ currentPage, pageSize })
    res.json({ code: responseCodes.SUCCESS, message: "Email list fetched successfully", data: emailList })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const exportDb = async (req, res) => {
  const data = await suiRankService.exportDb()
  res.json({ code: responseCodes.SUCCESS, message: "successfully", data })
}
export const importDb = async (req, res) => {
  const data = await suiRankService.importDb()
  res.json({ code: responseCodes.SUCCESS, message: "successfully", data })
}
