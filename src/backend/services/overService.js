import db from "@/utils/db"
import { OVER_STATUS_CONST } from "SHARE/over"
import { EMAIL_STATUS_CONST } from "SHARE/email"
import Mail from "@/utils/mail"
import dayjs from "dayjs"
import * as overApi from "@/api/over"
import { sleep } from "@/utils"

export const addAccount = async (name, email, remark) => {
  const res = await db.over.findOne({ email })
  if (res) {
    throw new Error("Email already exists")
  }
  const newEmail = { name, email, remark, created_at: new Date().getTime(), updated_at: new Date().getTime() }
  return await db.over.insert(newEmail)
}
export const getAccountById = async (id) => {
  return await db.over.findOne({ _id: id })
}

export const updateAccount = async (id, name, email) => {
  const updatedEmail = { name, email, updated_at: new Date() }
  await db.over.update({ _id: id }, { $set: updatedEmail })
}

export const deleteAccount = async (ids) => {
  const result = await db.over.remove({ _id: { $in: ids } }, { multi: true })
  return result
}

export const getAccounts = async ({ currentPage = 1, pageSize = 20, query = {}, sort = { created_at: -1 } }) => {
  const list = await db.over
    .find(query)
    .sort(sort)
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .exec()

  const formattedList = list.map((item) => {
    const { _id, status, created_at, updated_at, last_claim_at, last_quiz_at, next_claim_available_from, ...rest } = item
    return {
      id: _id, // 将 _id 重命名为 id
      created_at: formatTime(created_at),
      updated_at: formatTime(updated_at),
      last_claim_at: formatTime(last_claim_at, "MM-DD HH:mm:ss"),
      last_quiz_at: formatTime(last_quiz_at, "MM-DD HH:mm:ss"),
      status: formatStatus(item),
      ...rest,
    }
  })

  const total = await db.over.count()
  return { list: formattedList, pageInfo: { currentPage, pageSize, total } }
}
const formatStatus = ({ last_claim_at, last_quiz_at, can_solve = true }) => {
  const isSameDay = (timestamp1, timestamp2) => {
    const date1 = dayjs(timestamp1)
    const date2 = dayjs(timestamp2)
    return date1.isSame(date2, "day")
  }
  const UNCLAIM = !last_claim_at || !isSameDay(last_claim_at, new Date())
  const UNQUIZE = !last_quiz_at || !isSameDay(last_quiz_at, new Date()) || (isSameDay(last_quiz_at, new Date()) && can_solve)

  if (UNCLAIM && UNQUIZE) {
    return OVER_STATUS_CONST.UNFINISHED
  }
  if (UNCLAIM) {
    return OVER_STATUS_CONST.UNCLAIM
  }
  if (UNQUIZE) {
    return OVER_STATUS_CONST.UNQUIZE
  }
  return OVER_STATUS_CONST.FINISHIED
}
const formatTime = (timeStmp, fmt = "YYYY-MM-DD HH:mm:ss") => {
  if (!timeStmp) return ""
  return dayjs(timeStmp).format(fmt)
}
export const getEmails = async () => {
  //获取所有已绑定账户的邮箱
  const accounts = await db.over.find({})
  const boundEmails = accounts.map((emails) => emails.email)
  //获取所有邮箱
  const allEmails = await db.email.find({ status: EMAIL_STATUS_CONST.TOKEN }).sort({ created_at: -1 })
  //去重,找到未绑定的邮箱
  // 去重，找到未绑定的邮箱
  const unboundEmails = allEmails.filter((emails) => !boundEmails.includes(emails.email))
  return [
    ...unboundEmails,
    {
      created_at: "2023-09-15 02:14:33",
      email: "QOsVh308@maildrop.cc",
      id: "M1aSFxkH4zsCvERN",
      name: "邮箱 7",
      remark: "",
      updated_at: "2023-09-15 02:14:33",
    },
  ]
}

export const getDailyQuiz = async (email) => {
  const { tokens, cookie } = await getToken(email) // 获取 token
  console.log("获取任务信息")
  const { res, cookie: cookie7 } = await overApi.missionInfo(cookie, tokens.access_token)
  console.log(res.data)
  const { quiz_id } = res.data
  console.log("获取问题")
  const { res: quiz } = await overApi.quizStart(cookie7, tokens.access_token, quiz_id)
  return { question: quiz.data.question, choices: quiz.data.choices }
}

export const getDailyReward = async (email, answer) => {
  let cookie = ""
  let response = {}
  const { tokens, cookie: cookie5 } = await getToken(email) // 获取 token
  cookie = cookie5
  console.log("领分")
  const { res: claim, cookie: cookie6 } = await overApi.claim(cookie, tokens.access_token)
  cookie = cookie6
  console.log(claim)
  let updateInfo = {}
  if (claim.data && claim.data.is_completed) {
    updateInfo = {
      last_claim_at: new Date().getTime(),
      next_claim_available_from: new Date(claim.data.next_claim_available_from).getTime(),
      claim_reward: claim.data.reward,
    }
    response.claim_success = true
    response.claim_reward = claim.data.reward
  }
  if (!claim.data && claim.code === -14) {
    updateInfo = {
      last_claim_at: new Date().getTime(),
    }
    response.claim_success = false
  }
  await _updateAccount(email, updateInfo)
  if (answer) {
    const { is_success, quiz_reward } = await completeQuestion(email, cookie, tokens.access_token, answer) // 完成问卷
    response.quiz_success = is_success
    response.quiz_reward = quiz_reward
  }
  console.log("开始查分")
  const { res: point } = await overApi.getPoint(cookie, tokens.access_token) // 获取积分
  console.log(point)
  await _updateAccount(email, {
    point: point.data.point,
    previous_point: point.data.previous_point,
  })

  return response
  // if (!mailState.is_signup) {
  //   // 未注册
  // }
}

const getOverEmail = async (email) => {
  const mail = new Mail(email)
  const data = await mail.getMails({ q: "from:hello@over.network is:unread", orderBy: "internalDate", maxResults: 1 }, true)
  console.log(data.length)
  if (!data || !data.length) {
    return
  }
  const htmlStr = data[0].decodedHtml
  const regex = /<a href="([^"]+)"[^>]*>\s*&nbsp;\s*Click to verify Email\s*&nbsp;&nbsp;\s*<\/a>/

  const match = htmlStr.match(regex)
  if (match) {
    const url = match[1]
    console.log(`URL: ${url}`)
    const text = await fetch(url).then((res) => res.text())
    await sleep(1000)
    return text
  }

  return data
}

const getMailStatus = async (cookie, verifier, email, elapsedTime = 0) => {
  const timeout = 3 * 60 * 1000 // 5分钟转换为毫秒
  if (elapsedTime >= timeout) {
    throw new Error("Operation timed out after 2 minutes")
  }
  await getOverEmail(email)
  console.log("获取验证状态")
  const { res, cookie: cookie4 } = await overApi.getMailStatus(cookie, { verifier })
  console.log(res.data)
  if (!res.data) {
    await sleep(5000) // 等待5秒
    return await getMailStatus(cookie4, verifier, email, elapsedTime + 5000) // 增加已经过去的时间
  }
  return { res: res.data, cookie: cookie4 }
}

const completeQuestion = async (email, cookie, token, answer) => {
  console.log("获取任务信息")
  const { res, cookie: cookie7 } = await overApi.missionInfo(cookie, token)
  console.log(res.data)
  const { quiz_status, quiz_id } = res.data
  let updateInfo = {
    can_solve: false,
    last_quiz_at: new Date().getTime(),
  }
  let response = {
    is_success: false,
  }
  if (quiz_status === "can_solve") {
    console.log("获取问题")
    const { res: quiz, cookie: cookie8 } = await overApi.quizStart(cookie7, token, quiz_id)
    console.log(quiz.data)
    console.log("提交答案")
    const answerIdx = quiz.data.choices.findIndex((v) => v.toLowerCase().includes(answer.toLowerCase())) + 1
    console.log(answerIdx)
    if (answerIdx === 0) {
      console.log("未找到对应答案")
      return { question: quiz.data.question, choices: quiz.data.choices }
    }
    const { res: submitRes, cookie: cookie9 } = await overApi.quizSubmit(cookie8, token, quiz_id, {
      answer_list: [answerIdx],
    })
    if (submitRes.data.quiz_status === "failed") {
      updateInfo = { can_solve: false }
      response = { is_success: false }
    }
    if (submitRes.data.quiz_status === "can_solve") {
      updateInfo = { can_solve: true }
      response = { is_success: false }
    }
    if (submitRes.data.quiz_status === "solved") {
      updateInfo = { can_solve: false }
      response = { is_success: true, quiz_reward: submitRes.data.reward }
    }
    console.log(submitRes)
  }
  await _updateAccount(email, updateInfo)
  return response
}

const getToken = async (email) => {
  console.log("执行登录逻辑")
  const account = await db.over.findOne({ email })
  if (!account) {
    throw new Error("Email not exist")
  }
  console.log(account)
  const { cookie: cookie1 } = await overApi.getVersion()
  let tokens = { access_token: account.access_token, refresh_token: account.refresh_token }
  let cookie = cookie1
  if (!account.access_token) {
    console.log("获取邮件注册状态")
    const { res: mailState, cookie: cookie2 } = await overApi.checkMail(cookie1, { email })
    console.log(mailState)
    console.log("获取验证邮件")
    const { res, cookie: cookie3 } = await overApi.getMail(cookie2, { email })
    const verifier = res.data.verifier
    console.log(res)
    console.log("开始轮询等待邮件点击")
    const { res: _tokens, cookie: cookie5 } = await getMailStatus(cookie3, verifier, email)
    console.log(_tokens)
    // 更新操作：设置 token 字段
    await _updateAccount(email, {
      access_token: _tokens.access_token,
      refresh_token: _tokens.refresh_token,
    })
    tokens = _tokens
    cookie = cookie5
  }
  try {
    console.log("登录获取用户信息")
    const { res: userInfo } = await overApi.signin(cookie, tokens.access_token)
    // 更新操作：更新用户信息
    await _updateAccount(email, {
      my_invite_code: userInfo.data.my_invite_code,
      over_name: userInfo.data.name,
      timezone: userInfo.data.timezone,
    })
    console.log(userInfo)
  } catch (error) {
    console.log(error)
    if (error.response.status === 401) {
      console.log("token失效,刷新token")
      //token失效,刷新token
      const {
        res: {
          data: { access_token },
        },
      } = await overApi.refresh(cookie, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      })
      console.log(access_token)
      // 更新操作：设置 token 字段
      await _updateAccount(email, {
        access_token,
      })
      tokens.access_token = access_token
    }
  }

  return { tokens, cookie }
}

const _updateAccount = async (email, account) => {
  await db.over.update(
    { email },
    {
      $set: {
        ...account,
      },
    }
  )
}

export const updateSetting = async (setting) => {
  await db.setting_over.update(
    { type: "over" },
    {
      $set: {
        setting,
      },
    },
    {
      upsert: true,
    }
  )
}

export const getSetting = async () => {
  const setting = await db.setting_over.findOne({ type: "over" })
  return setting?.setting
}