import axios from "axios"
import { Message } from "element-ui"
const baseURL = process.env.VUE_APP_FRONTEND_BASE_URL || "http://localhost:3333"
const request = axios.create({
  // headers: {
  //   "content-type": "application/json",
  //   authority: "quests.mystenlabs.com",
  //   Referer: "https://quests.mystenlabs.com/?ref=tech.mystenlabs.com",
  //   "User-Agent": "PostmanRuntime/7.33.0",
  // },
  baseURL,
  timeout: 0,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log(response, "response")
    if (response.data.code !== 200) {
      return Promise.reject(response.data.message)
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 基于axios的基础请求封装
const http = (options) => {
  return new Promise((resolve, reject) => {
    request(options)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        Message.error(err)
        reject(err)
      })
  })
}

export default http
