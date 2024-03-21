import http from "@/utils/http"

// 获取列表数据
export function list(params) {
  return http({
    url: `/metaCene/list`,
    method: "get",
    params,
  })
}

// 添加新数据
export function add(data) {
  return http({
    url: `/metaCene/create`,
    method: "post",
    data,
  })
}

// 更新数据
export function update(data) {
  return http({
    url: `/metaCene/update`,
    method: "post",
    data,
  })
}

// 删除数据
export function remove(data) {
  return http({
    url: `/metaCene/remove`,
    method: "post",
    data,
  })
}

// 获取单个数据详情
export function detail(id) {
  return http({
    url: `/metaCene/detail/${id}`,
    method: "get",
  })
}
// 获取游戏数据
export function getDetail(id) {
  return http({
    url: `/metaCene/getDetail/${id}`,
    method: "get",
  })
}
// 获取游戏数据
export function getSpar(id) {
  return http({
    url: `/metaCene/getSpar/${id}`,
    method: "get",
  })
}
// 升级
export function roleLvUp(data) {
  return http({
    url: `/metaCene/roleLvUp`,
    method: "post",
    data
  })
}
// 升级
export function useEnergy(data) {
  return http({
    url: `/metaCene/useEnergy`,
    method: "post",
    data
  })
}
// 升级
export function wakeUp(id) {
  return http({
    url: `/metaCene/wakeUp/${id}`,
    method: "get",
  })
}
// 升级
export function doTask(id) {
  return http({
    url: `/metaCene/doTask/${id}`,
    method: "get",
  })
}
// 升级
export function charge(data) {
  return http({
    url: `/metaCene/charge`,
    method: "post",
    data
  })
}
// 升级
export function getLottoIndex(data) {
  return http({
    url: `/metaCene/getLottoIndex`,
    method: "post",
    data
  })
}

