import http from "@/utils/http"

export function list(params) {
  return http({
    url: `/over/list`,
    method: "get",
    params,
  })
}
export function add(data) {
  return http({
    url: `/over/create`,
    method: "post",
    data,
  })
}
export function update(data) {
  return http({
    url: `/over/update`,
    method: "post",
    data,
  })
}
export function remove(data) {
  return http({
    url: `/over/remove`,
    method: "post",
    data,
  })
}
export function detail(id) {
  return http({
    url: `/over/detail/${id}`,
    method: "get",
  })
}
export function emails() {
  return http({
    url: `/over/emails`,
    method: "get",
  })
}
export function dailyReward(email) {
  return http(
    {
      url: `/over/dailyReward/${email}`,
      method: "get",
    },
    {
      timeout: 1000 * 60 * 5,
    }
  )
}
export function dailyQuiz(email) {
  return http(
    {
      url: `/over/dailyQuiz/${email}`,
      method: "get",
    },
    {
      timeout: 1000 * 60 * 5,
    }
  )
}
