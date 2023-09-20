import axios from "axios"
const baseURL = "https://mover-api-prod.over.network/"

const request = axios.create({
  baseURL,
  timeout: 0,
  headers: {
    "User-Agent": "okhttp/4.9.2",
    "client-version": "1.0.6.51",
  },
})

// 基于axios的基础请求封装
const http = (options) => {
  return new Promise((resolve, reject) => {
    request(options)
      .then((res) => {
        resolve({ res: res.data, cookie: getCookies(res) })
      })
      .catch((err) => {
        console.log(err)
        reject(err)
      })
  })
}

export function getVersion(data) {
  return http({
    method: "get",
    url: "/public/app-version/android",
    data,
  })
}
export function checkMail(cookie, data) {
  return http({
    headers: {
      cookie,
    },
    method: "post",
    url: "/auth/check/email",
    data,
  })
}

//获取邮件
export function getMail(cookie, data) {
  return http({
    headers: {
      cookie,
    },
    method: "post",
    url: "/auth/request",
    data: {
      ...data,
      agreement: {
        agree_push_alert: true,
        agree_push_daily_reward: false,
        agree_marketing: true,
        agree_marketing_at: null,
        agree_push_marketing: true,
        agree_email_marketing: true,
        push_alert_permission: "granted",
      },
      language: "en",
    },
  })
}

//查询邮件验证状态
export function getMailStatus(cookie, data) {
  return http({
    headers: {
      cookie,
    },
    method: "post",
    url: "/auth/signin",
    data: {
      timezone: "Asia/Shanghai",
      language: "en",
      device_os: "android",
      ...data,
    },
  })
}
//登录
export function signin(cookie, token) {
  return http({
    headers: {
      cookie,
      authorization: getAuthorization(token),
    },
    method: "get",
    url: "/user/signin",
  })
}
//刷新token
export function refresh(cookie, data) {
  return http({
    headers: {
      cookie,
    },
    method: "post",
    url: "/auth/refresh",
    data
  })
}
//查分
export function getPoint(cookie, token) {
  return http({
    headers: {
      cookie,
      authorization: getAuthorization(token),
    },
    method: "get",
    url: "/user",
  })
}
//领分
export function claim(cookie, token) {
  return http({
    headers: {
      cookie,
      authorization: getAuthorization(token),
    },
    method: "post",
    url: "/daily/claim",
  })
}
//查询每日任务获取问题id
export function missionInfo(cookie, token) {
  return http({
    headers: {
      cookie,
      authorization: getAuthorization(token),
    },
    method: "get",
    url: "/mission/3/info",
  })
}
//根据问题id查询问题内容
export function quizStart(cookie, token, id) {
  return http({
    headers: {
      cookie,
      authorization: getAuthorization(token),
    },
    method: "get",
    url: `/mission/3/quiz/${id}/start`,
  })
}
//提交答案
export function quizSubmit(cookie, token, id, data) {
  return http({
    headers: {
      cookie,
      authorization: getAuthorization(token),
    },
    method: "post",
    url: `/mission/3/quiz/${id}/submit`,
    data,
  })
}

const getCookies = (res) => {
  if (!res.headers["set-cookie"]) return ""
  return res.headers["set-cookie"].map((item) => item.split(";")[0]).join(";")
}

const getAuthorization = (token) => {
  console.log(token)
  return `Bearer ${token}`
}
