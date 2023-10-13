import axios from "axios"
const baseURL = "https://www.suilette.com/api/history/"
const request = axios.create({
  baseURL,
  timeout: 60000,
  headers: {},
})
export const getHistory = () => {
  return request({
    method: "get",
    url: "sui-past",
  })
}
