import axios from 'axios'
const baseURL = "http://localhost:3000";

const request = axios.create({
  baseURL,
  timeout: 0,
});


// 基于axios的基础请求封装
const http = (options) => {
  return new Promise((resolve, reject) => {
    request(options).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

export default http