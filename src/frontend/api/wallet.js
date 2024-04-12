import http from "@/utils/http"

// 列表
export function list(params) {
  return http({
    url: `/wallet/list`,
    method: "get",
    params,
  })
}


// 添加新数据
export function add(data) {
  return http({
    url: `/wallet/add`,
    method: "post",
    data,
  })
}

// 更新数据
export function update(data) {
  return http({
    url: `/wallet/update`,
    method: "post",
    data,
  })
}

// 删除数据
export function remove(data) {
  return http({
    url: `/wallet/remove`,
    method: "post",
    data,
  })
}

// 获取单个数据详情
export function detail(id) {
  return http({
    url: `/wallet/detail/${id}`,
    method: "get",
  })
}
// 
export function createWallet(data) {
  return http({
    url: `/wallet/createWallet`,
    method: "post",
    data
  })
}
// 列表
export function walletList(params) {
  return http({
    url: `/wallet/walletList`,
    method: "get",
    params,
  })
}
// 列表
export function faucet(params) {
  return http({
    url: `/wallet/faucet`,
    method: "get",
    params,
  })
}
// 列表
export function getBalance(params) {
  return http({
    url: `/wallet/getBalance`,
    method: "get",
    params,
  })
}
// 列表
export function exportFile(data) {
  return http({
    url: `/wallet/exportFile`,
    method: "post",
    data,
  })
}