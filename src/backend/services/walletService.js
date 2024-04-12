import db from "@/db"
import dayjs from "dayjs"
import { scriptLog } from '@/utils/log'
import { generateMnemonic, mnemonicToWalletInfo, getAddressBalance } from '@/utils/wallet'
import Datastore from "nedb-promises"
import { app } from "electron"
import path from "path"
import { SocksProxyAgent } from "socks-proxy-agent"
import axios from "axios"
import { batchRunFn } from "@/utils"
import ExportHelper from '@/utils/exportHelper'
import { title } from "process"
const Captcha = require("@2captcha/captcha-solver")
let solver = null
let socks5ApiUrl = null
const headers = {
  'authority': 'faucet.0g.ai',
  'accept': '*/*',
  'accept-language': 'zh-HK,zh;q=0.9',
  'cache-control': 'no-cache',
  'content-type': 'text/plain;charset=UTF-8',
  'origin': 'https://faucet.0g.ai',
  'pragma': 'no-cache',
  'referer': 'https://faucet.0g.ai/',
  'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
}


export const add = async (name, dbid, remark) => {
  const nameExsit = await db.wallet.findOne({ name })
  const dbidExsit = await db.wallet.findOne({ dbid })
  if (nameExsit || dbidExsit) {
    throw new Error("name or dbid already exists")
  }
  const newData = { name, dbid, remark, created_at: new Date().getTime(), updated_at: new Date().getTime() }
  await db.wallet.insert(newData)
  await initDb(dbid)
  return
}
export const detail = async (id) => {
  return await db.wallet.findOne({ _id: id })
}

export const update = async (id, rest) => {
  const updatedEmail = { ...rest, updated_at: new Date().getTime() }
  await db.wallet.update({ _id: id }, { $set: updatedEmail })
}

export const remove = async (ids) => {
  const result = await db.wallet.remove({ _id: { $in: ids } }, { multi: true })
  return result
}

export const list = async ({ currentPage = 1, pageSize = 20, query = {} }) => {
  const list = await db.wallet
    .find(query)
    .sort({ created_at: 1, name: 1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .exec()
  const pList = list.map(async (item) => {
    const { _id, created_at, updated_at, ...rest } = item
    const walletDb = await initDb(item.dbid)
    const walletNum = await walletDb.count()
    return {
      id: _id, // 将 _id 重命名为 id
      walletNum,
      created_at: dayjs(created_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
      updated_at: dayjs(updated_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
      ...rest,
    }
  })
  const formattedList = await Promise.all(pList)
  console.log(formattedList)
  const total = await db.wallet.count()
  return { list: formattedList, pageInfo: { currentPage, pageSize, total } }
}

export const createWallet = async (dbid, num, remark) => {
  const walletDb = await initDb(dbid)
  const list = []
  for (let i = 0; i < num; i++) {
    const mnemonic = generateMnemonic()
    const walletDetail = await mnemonicToWalletInfo(mnemonic)
    const wallet = { ...walletDetail, mnemonic, remark, created_at: new Date().getTime(), updated_at: new Date().getTime() }
    list.push(wallet)
    await walletDb.insert(wallet)
    scriptLog(`创建第${i + 1}个完毕：${wallet.mnemonic}`)
  }
  return list
}

export const walletList = async (dbid, { currentPage = 1, pageSize = 20, query = {} }) => {
  const walletDb = await initDb(dbid)
  const list = await walletDb
    .find(query)
    .sort({ created_at: 1, name: 1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .exec()
  const formattedList = list.map((item) => {
    const { _id, created_at, updated_at, ...rest } = item
    return {
      id: _id, // 将 _id 重命名为 id
      created_at: dayjs(created_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
      updated_at: dayjs(updated_at).format("YYYY-MM-DD HH:mm:ss"), // 格式化时间
      ...rest,
    }
  })
  const total = await walletDb.count()
  return { list: formattedList, pageInfo: { currentPage, pageSize, total } }
}

export async function faucet(dbid, concurrencyLimit = 3) {
  const system_setting = await db.system_setting.findOne({ type: "system_setting" })
  if (!system_setting.twoCaptchaApi || !system_setting.socks5Api) {
    throw new Error("socks5Api 或 twoCaptchaApi 不存在。")
  }
  solver = new Captcha.Solver(system_setting.twoCaptchaApi)
  socks5ApiUrl = system_setting.socks5Api
  const walletDb = await initDb(dbid)
  const wallets = await walletDb.find({}).limit(100)
  let successCount = 0
  let faildCount = 0
  let jumpCount = 0
  let activeRequests = 0;
  let currentIndex = 0;

  const processNextRequest = async () => {
    if (currentIndex >= wallets.length) {
      return;
    }
    const index = currentIndex++;
    const wallet = wallets[index];
    scriptLog(`开始执行领水任务，当前第【${index + 1}】个`)
    if (wallet.zeroG && new Date().getTime() - wallet.zeroG.last_faucet_at <= 24 * 60 * 60 * 1000) {
      scriptLog(`该钱包24小时内已领水，跳过`)
      jumpCount++
      processNextRequest();
      return;
    }
    try {
      activeRequests++;
      await getFaucet(wallet.address)
      successCount++
      scriptLog(`第【${index + 1}】个钱包领水完成！剩余 ${wallets.length - jumpCount - successCount - faildCount} 个`)
      const zeroG = wallet.zeroG || {}
      await walletDb.update({ _id: wallet._id }, { $set: { zeroG: { ...zeroG, last_faucet_at: new Date().getTime() } } })
    } catch (error) {
      faildCount++
      scriptLog(error)
    } finally {
      activeRequests--;
      processNextRequest();
    }
  };

  while (activeRequests < concurrencyLimit && currentIndex < wallets.length) {
    processNextRequest();
  }

  // 等待所有请求完成
  while (activeRequests > 0) {
    await new Promise(resolve => setTimeout(resolve, 100)); // 等待一段时间
  }

  scriptLog(`任务执行结束：成功${successCount}个，跳过${jumpCount}个，失败${faildCount}个，共${wallets.length}个`)
}
export async function getBalance(dbid) {
  const walletDb = await initDb(dbid)
  const wallets = await walletDb.find({})
  // console.log(wallets)
  await batchRunFn(wallets, async (wallet) => {
    const balance = await getAddressBalance(wallet.address)
    scriptLog(`地址：${wallet.address} 余额：${balance}`)
    const zeroG = wallet.zeroG || {}
    await walletDb.update({ _id: wallet._id }, { $set: { zeroG: { ...zeroG, balance } } })
  }, 10)
}

const getFaucet = async (address) => {
  const proxy = await axios.get(socks5ApiUrl).then(res => res.data)
  scriptLog(`获取动态ip成功： ${proxy}，测试代理ip连接`)
  await testProxy(proxy)
  scriptLog(`代理ip连接成功，开始过验证`)
  const hcaptchaToken = await solver.hcaptcha({ pageurl: "https://faucet.0g.ai/", sitekey: "06ee6b5b-ef03-4491-b8ea-01fb5a80256f" }).then(res => res.data)
  scriptLog(`hcaptcha通过，开始领水`)
  const message = await axios.post('https://faucet.0g.ai/api/faucet', { address, hcaptchaToken }, {
    httpsAgent: new SocksProxyAgent(`socks5://${proxy}`),
    headers,
  }).then(res => res.data).catch(err => {
    console.log(err.response)
    throw `领水失败：${err.response?.data.message}`
  })
  scriptLog(message)
}

const testProxy = async (proxy) => {
  // 测试网站地址
  const testUrl = 'https://httpbin.org/get';
  return axios.get(testUrl, {
    httpsAgent: new SocksProxyAgent(`socks5://${proxy}`),
  }).catch(error => {
    throw new Error(`代理连接失败: socks5://${proxy}`)
  });
}

const initDb = async (dbid) => {
  const basePath = app.getPath("userData")
  const dbPath = path.join(basePath, "nedb/wallet")
  return Datastore.create({
    autoload: true,
    filename: path.join(dbPath, `${dbid}.db`),
  })
}

export const exportFile = async (dbid, fields, title = 'export.xlsx', style = []) => {
  const walletDb = await initDb(dbid)
  const list = await walletDb.find({})
  if (!list.length) throw `数据为空`
  console.log(fields)
  if (!fields) fields = Object.keys(list[0])
  ExportHelper.exportData(list, fields, style, 'excel', title)
}