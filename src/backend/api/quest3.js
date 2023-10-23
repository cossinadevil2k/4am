import axios from "axios"
const baseURL = "https://www.suilette.com/api/"
const request = axios.create({
  baseURL,
  timeout: 60000,
  headers: {},
})
request.defaults.proxy = {
  host: '192.168.31.104',
  port: '7890',
  protocol: 'http',
};
export const getHistory = () => {
  return request({
    method: "get",
    url: "history/sui-past",
  })
}
export const getGame = () => {
  return request({
    method: "get",
    url: "sui-game",
  })
}
export const contract = (data) => {
  return request({
    method: "post",
    url: "https://sui-mainnet.blastapi.io/bd1a4dc7-bdae-4abf-813a-3fd395578199",
    data
  })
}

export const getRank = (address) => {
  return request({
    headers: {
      "User-Agent": "PostmanRuntime/7.33.0",
      authority: "quests.mystenlabs.com",
      referer: "https://quests.mystenlabs.com/?ref=tech.mystenlabs.com",
      cookie:
        "AMP_MKTG_1fc9817a04=JTdCJTdE; _ga=GA1.1.1234800946.1690189467; _ga_69VEXYR7BC=GS1.1.1694021274.8.1.1694021440.0.0.0; AMP_1fc9817a04=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjI2YTMyODk4NS1hNDdjLTRiZGQtOTQ2MC1hZDE5MmQzMDhlYWElMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNjk3NTM3MzkwOTc0JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTY5NzUzOTM4MjQxNyUyQyUyMmxhc3RFdmVudElkJTIyJTNBNzk4OSU3RA==",
    },
    method: "get",
    url: `https://quests.mystenlabs.com/api/trpc/user?batch=1&input=%7B%220%22%3A%7B%22address%22%3A%22${address}%22%2C%22questId%22%3A3%7D%7D`,
  })
}
export const getSUINS = (address) => {
  return request({
    headers: {},
    method: "post",
    url: `https://suifrens-rpc.mainnet.sui.io/`,
    data: {
      jsonrpc: "2.0",
      id: "9",
      method: "suix_resolveNameServiceNames",
      params: [address, null, null],
    },
  })
}
