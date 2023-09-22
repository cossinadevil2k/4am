import * as emailService from "@/services/emailService"
import * as responseCodes from "@/constants/responseCodes"

export const createEmail = async (req, res) => {
  try {
    const { name, email, remark = "" } = req.body
    if (!name || !email) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "Name and email are required", data: null })
    }
    const emailRecord = await emailService.addEmail(name, email, remark)
    res.json({ code: responseCodes.SUCCESS, message: "Email created successfully", data: emailRecord })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const importEmail = async (req, res) => {
  try {
    const { emails } = req.body
    if (!emails || !emails.length) {
      return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "emails is required", data: null })
    }
    const emailRecord = await emailService.bacthImportEmails(emails)
    res.json({ code: responseCodes.SUCCESS, message: "Email created successfully", data: emailRecord })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getEmail = async (req, res) => {
  const id = req.params.id
  const email = await emailService.getEmailById(id)
  if (!email) {
    return res.status(responseCodes.NOT_FOUND).json({ code: responseCodes.NOT_FOUND, message: "Email not found", data: null })
  }
  res.json({ code: responseCodes.SUCCESS, message: "Email fetched successfully", data: email })
}

export const updateEmail = async (req, res) => {
  const { id, ...rest } = req.body
  await emailService.updateEmail(id, rest)
  res.json({ code: responseCodes.SUCCESS, message: "Email updated successfully", data: null })
}

export const deleteEmail = async (req, res) => {
  const { ids } = req.body
  if (!ids || ids.length === 0) {
    return res.status(responseCodes.BAD_REQUEST).json({ code: responseCodes.BAD_REQUEST, message: "ids is required", data: null })
  }
  await emailService.deleteEmails(ids)
  res.json({ code: responseCodes.SUCCESS, message: "Email deleted successfully", data: null })
}
export const getEmailList = async (req, res) => {
  try {
    const { currentPage, pageSize } = req.query || {}
    console.log(req.query)
    const emailList = await emailService.getEmails({ currentPage, pageSize })
    res.json({ code: responseCodes.SUCCESS, message: "Email list fetched successfully", data: emailList })
  } catch (error) {
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}

export const getCount = async (req, res) => {
  const count = await emailService.getEmailCount()
  res.json({ code: responseCodes.SUCCESS, message: "Email count fetched successfully", data: count })
}

export const getToken = async (req, res) => {
  const { email } = req.params
  const token = await emailService.getToken(email)
  res.json({ code: responseCodes.SUCCESS, message: "Email token fetched successfully", data: token })
}
export const getMails = async (req, res) => {
  try {
    const { id } = req.params
    const token = await emailService.getMails(id)
    res.json({ code: responseCodes.SUCCESS, message: "successfully", data: token })
  } catch (error) {
    console.log(error)
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const check = async (req, res) => {
  try {
    const { id } = req.params
    const token = await emailService.check(id)
    res.json({ code: responseCodes.SUCCESS, message: "successfully", data: token })
  } catch (error) {
    console.log(error)
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
export const openApikeyDir = async (req, res) => {
  try {
    const dir = await emailService.openApikeyDir()
    res.json({ code: responseCodes.SUCCESS, message: "successfully", data: dir })
  } catch (error) {
    console.log(error)
    res.json({ code: responseCodes.INTERNAL_SERVER_ERROR, message: error.message, data: null })
  }
}
