import * as overService from "@/services/overService"
import * as responseCodes from "@/constants/responseCodes"

export const createAccount = async (req, res) => {
  try {
    const { name, email, remark = "" } = req.body
    if (!name || !email) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "Name and email are required", data: null })
    }
    const emailRecord = await overService.addAccount(name, email, remark)
    res.json({ code: responseCodes.SUCCESS, message: "Email created successfully", data: emailRecord })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getAccount = async (req, res) => {
  const id = req.params.id
  const email = await overService.getAccountById(id)
  if (!email) {
    return res.status(responseCodes.NOT_FOUND).json({ code: responseCodes.NOT_FOUND, message: "Email not found", data: null })
  }
  res.json({ code: responseCodes.SUCCESS, message: "Email fetched successfully", data: email })
}

export const updateAccount = async (req, res) => {
  const { id, name, email } = req.body
  await overService.updateAccount(id, name, email)
  res.json({ code: responseCodes.SUCCESS, message: "Email updated successfully", data: null })
}

export const deleteAccount = async (req, res) => {
  const { ids } = req.body
  if (!ids || ids.length === 0) {
    return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "ids is required", data: null })
  }
  await overService.deleteAccount(ids)
  res.json({ code: responseCodes.SUCCESS, message: "Email deleted successfully", data: null })
}
export const getAccountList = async (req, res) => {
  try {
    const { currentPage, pageSize } = req.query || {}
    console.log(req.query)
    const emailList = await overService.getAccounts({ currentPage, pageSize })
    res.json({ code: responseCodes.SUCCESS, message: "Email list fetched successfully", data: emailList })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getEmails = async (req, res) => {
  try {
    const emailList = await overService.getEmails()
    res.json({ code: responseCodes.SUCCESS, message: "Email list fetched successfully", data: emailList })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getDailyReward = async (req, res) => {
  try {
    const { email, answer } = req.params
    const emailRecord = await overService.getDailyReward(email, answer)
    res.json({ code: responseCodes.SUCCESS, message: "success", data: emailRecord })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const getDailyQuiz = async (req, res) => {
  try {
    const { email } = req.params
    const emailRecord = await overService.getDailyQuiz(email)
    res.json({ code: responseCodes.SUCCESS, message: "success", data: emailRecord })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
