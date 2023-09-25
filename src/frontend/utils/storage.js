export const local = {
  // 存储缓存
  set: function (key, value, expireSeconds) {
    const data = {
      value,
      expire: expireSeconds ? new Date().getTime() + expireSeconds * 1000 : null,
    }
    localStorage.setItem(key, JSON.stringify(data))
  },

  // 获取缓存
  get: function (key) {
    const cachedData = localStorage.getItem(key)
    if (!cachedData) {
      return null
    }

    const { value, expire } = JSON.parse(cachedData)

    // 检查缓存是否过期
    if (expire && new Date().getTime() > expire) {
      localStorage.removeItem(key)
      return null
    }

    return value
  },

  // 删除缓存
  remove: function (key) {
    localStorage.removeItem(key)
  },

  // 清空所有缓存
  clearAll: function () {
    localStorage.clear()
  },
}
