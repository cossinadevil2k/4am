import http from "@/utils/http"

// 导出数据
export function exportDatabase() {
  return http({
    url: `/exportDatabase`,
    method: "get",
  })
}

// 导出数据
export function exportDbWithOption(data) {
  return http({
    url: `/exportDbWithOption`,
    method: "post",
    data
  })
}
// 导出数据
export function importDatabase() {
  return http({
    url: `/importDatabase`,
    method: "get",
  })
}
// 导入数据-根据数据key导入
export function importDbWithOption(data) {
  return http({
    url: `/importDbWithOption`,
    method: "post",
    data
  })
}
