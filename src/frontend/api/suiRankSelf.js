import http from "@/utils/http"

// 获取列表数据
export function list(params) {
  return http({
    url: `/suiRankSelf/list`,
    method: "get",
    params,
  })
}

// 添加新数据
export function add(data) {
  return http({
    url: `/suiRankSelf/create`,
    method: "post",
    data,
  })
}

// 更新数据
export function update(data) {
  return http({
    url: `/suiRankSelf/update`,
    method: "post",
    data,
  })
}
// 更新rank
export function updateRank(data) {
  return http({
    url: `/suiRankSelf/updateRank`,
    method: "post",
    data,
  })
}

// 删除数据
export function remove(data) {
  return http({
    url: `/suiRankSelf/remove`,
    method: "post",
    data,
  })
}

// 获取单个数据详情
export function detail(id) {
  return http({
    url: `/suiRankSelf/detail/${id}`,
    method: "get",
  })
}
// 导出
export function exportDb() {
  return http({
    url: `/suiRankSelf/exportDb`,
    method: "get",
  })
}
// 导入
export function importDb() {
  return http({
    url: `/suiRankSelf/importDb`,
    method: "get",
  })
}
// 批量新增
export function batchImport(data) {
  return http({
    url: `/suiRankSelf/batchImport`,
    method: "post",
    data
  })
}
