import * as walletService from "@/services/walletService"
import * as responseCodes from "@/constants/responseCodes"

export const add = async (req, res) => {
  try {
    const { name, dbid, remark = "" } = req.body
    if (!name || !dbid) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "Name and dbid is required", data: null })
    }
    const data = await walletService.add(name, dbid, remark)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const detail = async (req, res) => {
  const id = req.params.id
  const email = await walletService.detail(id)
  if (!email) {
    return res.status(responseCodes.NOT_FOUND).json({ code: responseCodes.NOT_FOUND, message: "not found", data: null })
  }
  res.json({ code: responseCodes.SUCCESS, message: "success", data: email })
}

export const update = async (req, res) => {
  const { id, created_at, ...rest } = req.body
  await walletService.update(id, rest)
  res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
}

export const remove = async (req, res) => {
  const { ids } = req.body
  if (!ids || ids.length === 0) {
    return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "ids is required", data: null })
  }
  await walletService.remove(ids)
  res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
}
export const list = async (req, res) => {
  try {
    const { currentPage, pageSize } = req.query || {}
    console.log(req.query)
    const list = await walletService.list({ currentPage, pageSize })
    res.json({ code: responseCodes.SUCCESS, message: "success", data: list })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const walletList = async (req, res) => {
  try {
    const { dbid, currentPage, pageSize } = req.query || {}
    console.log(req.query)
    const list = await walletService.walletList(dbid, { currentPage: Number(currentPage), pageSize: Number(pageSize) })
    res.json({ code: responseCodes.SUCCESS, message: "success", data: list })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const createWallet = async (req, res) => {
  try {
    const { dbid, num, remark = "" } = req.body
    if (!num || Number(num) <= 0 || !dbid) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "num and dbid is required", data: null })
    }
    const data = await walletService.createWallet(dbid, Number(num), remark)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const faucet = async (req, res) => {
  try {
    const { dbid } = req.query
    if (!dbid) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: " dbid is required", data: null })
    }
    const data = await walletService.faucet(dbid)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const getBalance = async (req, res) => {
  try {
    const { dbid } = req.query
    if (!dbid) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: " dbid is required", data: null })
    }
    const data = await walletService.getBalance(dbid)
    res.json({ code: responseCodes.SUCCESS, message: "success", data })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const exportFile = async (req, res) => {
  try {
    const { dbid, fields, style, title } = req.body
    if (!dbid) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: " dbid is required", data: null })
    }
    await walletService.exportFile(dbid, fields, title, style)
    res.json({ code: responseCodes.SUCCESS, message: "success", data: null })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}