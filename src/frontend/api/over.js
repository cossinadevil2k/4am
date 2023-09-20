import http from "@/utils/http"

// 获取列表数据
export function list(params) {
  return http({
    url: `/over/list`,
    method: "get",
    params,
  })
}

// 添加新数据
export function add(data) {
  return http({
    url: `/over/create`,
    method: "post",
    data,
  })
}

// 更新数据
export function update(data) {
  return http({
    url: `/over/update`,
    method: "post",
    data,
  })
}

// 删除数据
export function remove(data) {
  return http({
    url: `/over/remove`,
    method: "post",
    data,
  })
}

// 获取单个数据详情
export function detail(id) {
  return http({
    url: `/over/detail/${id}`,
    method: "get",
  })
}

// 获取邮件列表
export function emails() {
  return http({
    url: `/over/emails`,
    method: "get",
  })
}

// 获取每日奖励
export function dailyReward(email, answer) {
  return http(
    {
      url: `/over/dailyReward/${email}`,
      method: "get",
      params: {
        answer,
      },
    },
    {
      timeout: 1000 * 60 * 5, // 设置超时时间为5分钟
    }
  )
}

// 获取每日问题
export function dailyQuiz(email) {
  return http(
    {
      url: `/over/dailyQuiz/${email}`,
      method: "get",
    },
    {
      timeout: 1000 * 60 * 5, // 设置超时时间为5分钟
    }
  )
}

// 获取设置信息
export function getSetting() {
  return http({
    url: `/over/getSetting`,
    method: "get",
  })
}

// 更新设置信息
export function updateSetting(data) {
  return http({
    url: `/over/updateSetting`,
    method: "post",
    data,
  })
}
