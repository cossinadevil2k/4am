import http from "@/utils/http"

// 监控历史数据
export function getHistory(params) {
  return http({
    url: `/quest3/watchHistory`,
    method: "get",
    params,
  })
}
// 停止监控历史数据
export function stopWatch(params) {
  return http({
    url: `/quest3/stopWatch`,
    method: "get",
    params,
  })
}
// 获取监控历史数据
export function getHistoryRecord(params) {
  return http({
    url: `/quest3/getHistoryRecord`,
    method: "get",
    params,
  })
}
// 获取玩轮盘的用户
export function getPlayer(params) {
  return http({
    url: `/quest3/getPlayer`,
    method: "get",
    params,
  })
}
// 停止监控历史数据
export function stopPlayer(params) {
  return http({
    url: `/quest3/stopPlayer`,
    method: "get",
    params,
  })
}
