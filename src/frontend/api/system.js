import http from "@/utils/http"

// 导出数据
export function exportDatabase() {
  return http({
    url: `/exportDatabase`,
    method: "get",
  })
}
