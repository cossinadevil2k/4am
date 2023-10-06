import db from "@/db"
import { OVER_STATUS_CONST } from "SHARE/over"
import { EMAIL_STATUS_CONST } from "SHARE/email"
import Mail from "@/utils/mail"
import dayjs from "dayjs"
import OverApiConstructor from "@/api/over"
import { sleep } from "@/utils"
import { scriptLog } from "@/utils/log"
export const addAccount = async (name, email, remark) => {
  const res = await db.over.findOne({ email })
  if (res) {
    throw new Error("Email already exists")
  }
  const newEmail = { name, email, remark, created_at: new Date().getTime(), updated_at: new Date().getTime() }
  return await db.over.insert(newEmail)
}
export const getAccountById = async (id) => {
  const account = await db.over.findOne({ _id: id })
  return formatAccount(account)
}
export const getAccountByEmail = async (email) => {
  const account = await db.over.findOne({ email })
  return formatAccount(account)
}

export const updateAccount = async (id, name, remark) => {
  const updatedEmail = { remark, name, updated_at: new Date() }
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
    return formatAccount(item)
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
const formatTime = (timeStmp, fmt = "YY-MM-DD HH:mm:ss") => {
  if (!timeStmp) return ""
  return dayjs(timeStmp).format(fmt)
}

const formatAccount = (account) => {
  const { _id, status, created_at, updated_at, last_claim_at, last_quiz_at, next_claim_available_from, ...rest } = account
  return {
    id: _id, // 将 _id 重命名为 id
    created_at: formatTime(created_at),
    updated_at: formatTime(updated_at),
    last_claim_at: formatTime(last_claim_at, "MM-DD HH:mm:ss"),
    last_quiz_at: formatTime(last_quiz_at, "MM-DD HH:mm:ss"),
    status: formatStatus(account),
    ...rest,
  }
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
  return [...unboundEmails]
}

export const getDailyQuiz = async (email) => {
  const { tokens, cookie } = await login(email) // 获取 token
  scriptLog("获取任务信息")
  const { res, cookie: cookie7 } = await overApi.missionInfo(cookie, tokens.access_token)
  scriptLog(res.data)
  const { quiz_id } = res.data
  scriptLog("获取问题")
  const { res: quiz } = await overApi.quizStart(cookie7, tokens.access_token, quiz_id)
  return { question: quiz.data.question, choices: quiz.data.choices }
}

export const getDailyReward = async (email, answer) => {
  const overApi = new OverApiConstructor()
  const setting = await getSetting()
  const emailDetail = await db.email.findOne({ email })
  if (setting.use_email_proxy && emailDetail.proxy_host && emailDetail.proxy_port) {
    let proxy = {
      host: emailDetail.proxy_host,
      port: emailDetail.proxy_port,
      userId: emailDetail.proxy_username,
      password: emailDetail.proxy_password,
    }
    overApi.setProxy(proxy)
  }
  let response = {}
  await login(email, overApi) // 获取 token
  scriptLog("领分")
  const { res: claim } = await overApi.claim()
  scriptLog(claim)
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
  const { is_success, quiz_reward } = await completeQuestion(overApi, email, answer) // 完成问卷
  response.quiz_success = is_success
  response.quiz_reward = quiz_reward
  scriptLog("开始查分")
  const { res: point } = await overApi.getPoint() // 获取积分
  scriptLog(point)
  scriptLog("查排名")
  const { res: rankRes } = await overApi.getRank()
  scriptLog(rankRes.data)
  await _updateAccount(email, {
    point: point.data.point,
    previous_point: point.data.previous_point,
    rank: rankRes.data.rank,
    user_count: rankRes.data.user_count,
  })
  const account = await getAccountByEmail(email)
  response.account = account
  return response
}

const getOverEmail = async (email) => {
  const mail = new Mail(email)
  const data = await mail.getMails({ q: "from:hello@over.network is:unread", orderBy: "internalDate", maxResults: 1 }, true)
  scriptLog(data.length)
  if (!data || !data.length) {
    return
  }
  const htmlStr = data[0].decodedHtml
  const regex = /<a href="([^"]+)"[^>]*>\s*&nbsp;\s*Click to verify Email\s*&nbsp;&nbsp;\s*<\/a>/

  const match = htmlStr.match(regex)
  if (match) {
    const url = match[1]
    scriptLog(`URL: ${url}`)
    const text = await fetch(url)
      .then((res) => res.text())
      .catch((err) => {
        console.log(err)
      })
    await sleep(1000)
    return text
  }

  return data
}

const getMailStatus = async (overApi, verifier, email, elapsedTime = 0) => {
  const timeout = 3 * 60 * 1000 // 5分钟转换为毫秒
  if (elapsedTime >= timeout) {
    throw new Error("Operation timed out after 2 minutes")
  }
  if (email.includes("@gmail.com")) {
    await getOverEmail(email).catch((err) => {
      console.log(err)
    })
  }
  scriptLog("获取验证状态")
  const { res } = await overApi.getMailStatus({ verifier })
  scriptLog(res.data)
  if (!res.data) {
    await sleep(5000) // 等待5秒
    return await getMailStatus(overApi, verifier, email, elapsedTime + 5000) // 增加已经过去的时间
  }
  return { res: res.data }
}

const completeQuestion = async (overApi, email, answer) => {
  scriptLog("获取任务信息")
  const { res } = await overApi.missionInfo()
  scriptLog(res.data)
  const { quiz_status, quiz_id } = res.data
  let updateInfo = {
    can_solve: false,
    last_quiz_at: new Date().getTime(),
  }
  let response = {
    is_success: false,
  }
  if (quiz_status === "can_solve" && answer) {
    scriptLog("获取问题")
    const { res: quiz } = await overApi.quizStart(quiz_id)
    scriptLog(quiz.data)
    scriptLog("提交答案")
    const answerIdx = quiz.data.choices.findIndex((v) => v.toLowerCase().includes(answer.toLowerCase())) + 1
    scriptLog(answerIdx)
    if (answerIdx === 0) {
      scriptLog("未找到对应答案")
      return { question: quiz.data.question, choices: quiz.data.choices }
    }
    const { res: submitRes } = await overApi.quizSubmit(quiz_id, {
      answer_list: [answerIdx],
    })
    if (submitRes.data.quiz_status === "failed") {
      updateInfo.can_solve = false
      response = { is_success: false }
    }
    if (submitRes.data.quiz_status === "can_solve") {
      updateInfo.can_solve = true
      response = { is_success: false }
    }
    if (submitRes.data.quiz_status === "solved") {
      updateInfo.can_solve = false
      response = { is_success: true, quiz_reward: submitRes.data.reward }
    }
    scriptLog(submitRes)
  }
  await _updateAccount(email, updateInfo)
  return response
}

const login = async (email, overApi) => {
  scriptLog("执行登录逻辑")
  const account = await db.over.findOne({ email })
  if (!account) {
    throw new Error("Email not exist")
  }
  scriptLog(account)
  await overApi.getVersion()
  let tokens = { access_token: account.access_token, refresh_token: account.refresh_token }
  overApi.setToken(account.access_token) // 设置token
  if (!account.access_token) {
    scriptLog("获取邮件注册状态")
    const { res: mailState } = await overApi.checkMail({ email })
    scriptLog(mailState)
    scriptLog("获取验证邮件")
    const { res } = await overApi.getMail({ email })
    const verifier = res.data.verifier
    scriptLog(res)
    scriptLog("开始轮询等待邮件点击")
    const { res: _tokens } = await getMailStatus(overApi, verifier, email)
    scriptLog(_tokens)
    // 更新操作：设置 token 字段
    await _updateAccount(email, {
      access_token: _tokens.access_token,
      refresh_token: _tokens.refresh_token,
    })
    tokens = _tokens
    overApi.setToken(_tokens.access_token) // 设置token
  }
  try {
    await registryOrLogin(email, overApi)
  } catch (error) {
    if (error.response.status === 401) {
      scriptLog("token失效,刷新token")
      overApi.removeToken()
      //token失效,刷新token
      const {
        res: {
          data: { access_token },
        },
      } = await overApi.refresh({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      })
      scriptLog(access_token)
      // 更新操作：设置 token 字段
      await _updateAccount(email, {
        access_token,
      })
      tokens.access_token = access_token
      overApi.setToken(access_token)
      await registryOrLogin(email, overApi)
    } else {
      throw error
    }
  }
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
  let setting = await db.setting_over.findOne({ type: "over" })

  // 如果没有找到设置，就创建一个新的设置项
  if (!setting) {
    const defaultSetting = {
      type: "over",
      setting: {
        invite_code: "",
        use_email_proxy: false,
        /* 默认设置内容 */
      },
    }
    await db.setting_over.insert(defaultSetting)
    setting = defaultSetting
  }

  return setting?.setting
}
const registryOrLogin = async (email, overApi) => {
  scriptLog("登录获取用户信息")
  const { res: userInfo } = await overApi.signin()
  // 更新操作：更新用户信息
  await _updateAccount(email, {
    invite_code: userInfo.data.invite_code,
    my_invite_code: userInfo.data.my_invite_code,
    over_name: userInfo.data.name,
    timezone: userInfo.data.timezone,
  })
  scriptLog(userInfo)
  if (!userInfo.data.name) {
    scriptLog("用户名不存在,开始注册")
    const name = getRandomName()
    const { res } = await overApi.checkUsername(name)
    if (res.code !== 0) {
      scriptLog("用户名已存在或不合法", name)
      await sleep(1000)
      return await registryOrLogin(email, overApi)
    }
    const { res: setRes } = await overApi.setUsername(name)
    scriptLog("设置用户名成功", name)
    scriptLog(setRes)
    await sleep(1000)
    return await registryOrLogin(email, overApi)
  }
  if (!userInfo.data.invite_code && !userInfo.data.is_landing) {
    scriptLog("开始填写邀请码")
    const { invite_code } = await getSetting()
    if (!invite_code) throw new Error("邀请码不存在,请设置邀请码")
    const { res: checkRes } = await overApi.checkInviteCode(invite_code)
    if (checkRes.code !== 0) {
      throw new Error("邀请码校验失败")
    }
    scriptLog("提交邀请码", invite_code)
    await overApi.setInviteCode(invite_code)
    await sleep(1000)
    return await registryOrLogin(email, overApi)
  }
  if (userInfo.data.need_claim_invite) {
    scriptLog("获取邀请奖励")
    await overApi.claimInvite()
    await sleep(1000)
    scriptLog("获取注册初始分")
    await overApi.claimFirstTimePoint()
    await sleep(1000)
    return await registryOrLogin(email, overApi)
  }
  return
}
const getRandomName = () => {
  var chars = "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ12345678900123456789"
  var string = ""
  for (var ii = 0; ii < 8; ii++) {
    string += chars[Math.floor(Math.random() * chars.length)]
  }
  return string
}
