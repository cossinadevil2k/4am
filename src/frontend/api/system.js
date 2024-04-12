import http from "@/utils/http"

// 导出数据
export function exportDatabase() {
  return http({
    url: `/system/exportDatabase`,
    method: "get",
  })
}

// 导出数据
export function exportDbWithOption(data) {
  return http({
    url: `/system/exportDbWithOption`,
    method: "post",
    data
  })
}
// 导出数据
export function importDatabase() {
  return http({
    url: `/system/importDatabase`,
    method: "get",
  })
}
// 导入数据-根据数据key导入
export function importDbWithOption(data) {
  return http({
    url: `/system/importDbWithOption`,
    method: "post",
    data
  })
}
// 更新系统设置
export function updateSystemSetting(data) {
  return http({
    url: `/system/updateSystemSetting`,
    method: "post",
    data
  })
}
