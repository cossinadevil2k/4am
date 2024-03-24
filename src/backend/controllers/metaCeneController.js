import * as metaCeneService from "@/services/metaCeneService"
import * as responseCodes from "@/constants/responseCodes"

export const createAccount = async (req, res) => {
  try {
    const { name, cookie, twid, remark = "", ...rest } = req.body
    if (!name || !cookie) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "Name and cookie are required", data: null })
    }
    const emailRecord = await metaCeneService.addAccount(name, cookie, twid, remark, rest)
    res.json({ code: responseCodes.SUCCESS, message: "Email created successfully", data: emailRecord })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getAccount = async (req, res) => {
  const id = req.params.id
  const email = await metaCeneService.getAccountById(id)
  if (!email) {
    return res.status(responseCodes.NOT_FOUND).json({ code: responseCodes.NOT_FOUND, message: "Email not found", data: null })
  }
  res.json({ code: responseCodes.SUCCESS, message: "success", data: email })
}

export const updateAccount = async (req, res) => {
  const { id, remark, name, cookie, twid, ...rest } = req.body
  await metaCeneService.updateAccount(id, name, remark, cookie, twid, rest)
  res.json({ code: responseCodes.SUCCESS, message: "Email updated successfully", data: null })
}

export const deleteAccount = async (req, res) => {
  const { ids } = req.body
  if (!ids || ids.length === 0) {
    return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "ids is required", data: null })
  }
  await metaCeneService.deleteAccount(ids)
  res.json({ code: responseCodes.SUCCESS, message: "Email deleted successfully", data: null })
}
export const getAccountList = async (req, res) => {
  try {
    const { currentPage, pageSize, sort } = req.query || {}

    const emailList = await metaCeneService.getAccounts({ currentPage, pageSize, sort: JSON.parse(sort || "") })
    res.json({ code: responseCodes.SUCCESS, message: "Email list fetched successfully", data: emailList })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getDetail = async (req, res) => {
  try {
    const id = req.params.id
    const data = await metaCeneService.getDetail({ id })
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const getSpar = async (req, res) => {
  try {
    const id = req.params.id
    const data = await metaCeneService.getSpar(id)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const getLottoIndex = async (req, res) => {
  try {
    const id = req.body.id
    const data = await metaCeneService.getLottoIndex(id)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const wakeUp = async (req, res) => {
  try {
    const id = req.params.id
    const data = await metaCeneService.wakeUp(id)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const charge = async (req, res) => {
  try {
    const { id } = req.body
    const data = await metaCeneService.charge(id)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const exchange = async (req, res) => {
  try {
    const { id, amount } = req.body
    const data = await metaCeneService.exchange(id, amount)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const roleLvUp = async (req, res) => {
  try {
    const { id, roleId } = req.body
    const data = await metaCeneService.roleLvUp(id, roleId)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const useEnergy = async (req, res) => {
  try {
    const { id, roleId } = req.body
    const data = await metaCeneService.useEnergy(id, roleId)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const doTask = async (req, res) => {
  try {
    const { id } = req.params
    const data = await metaCeneService.doTask(id)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
