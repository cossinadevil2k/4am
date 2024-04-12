import http from "@/utils/http"

// 列表
export function list(params) {
  return http({
    url: `/a0gi/list`,
    method: "get",
    params,
  })
}


// 添加新数据
export function add(data) {
  return http({
    url: `/a0gi/add`,
    method: "post",
    data,
  })
}

// 更新数据
export function update(data) {
  return http({
    url: `/a0gi/update`,
    method: "post",
    data,
  })
}

// 删除数据
export function remove(data) {
  return http({
    url: `/a0gi/remove`,
    method: "post",
    data,
  })
}

// 获取单个数据详情
export function detail(id) {
  return http({
    url: `/a0gi/detail/${id}`,
    method: "get",
  })
}

// 列表
export function faucet(params) {
    return http({
      url: `/a0gi/faucet`,
      method: "get",
      params,
    })
  }
  // 列表
  export function getBalance(params) {
    return http({
      url: `/a0gi/getBalance`,
      method: "get",
      params,
    })
  }