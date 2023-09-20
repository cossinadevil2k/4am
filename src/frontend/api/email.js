import http from "@/utils/http"

export function list(params) {
  return http({
    url: `/email/list`,
    method: "get",
    params,
  })
}
export function add(data) {
  return http({
    url: `/email/create`,
    method: "post",
    data,
  })
}
export function batchImport(data) {
  return http({
    url: `/email/import`,
    method: "post",
    data,
  })
}
export function update(data) {
  return http({
    url: `/email/update`,
    method: "post",
    data,
  })
}
export function remove(data) {
  return http({
    url: `/email/remove`,
    method: "post",
    data,
  })
}
export function detail(id) {
  return http({
    url: `/email/detail/${id}`,
    method: "get",
  })
}
export function count() {
  return http({
    url: `/email/count`,
    method: "get",
  })
}
export function token(email) {
  return http({
    url: `/email/token/${email}`,
    method: "get",
  })
}
export function check(id) {
  return http({
    url: `/email/check/${id}`,
    method: "get",
  })
}
export function mails(id) {
  return http({
    url: `/email/mails/${id}`,
    method: "get",
  })
}
