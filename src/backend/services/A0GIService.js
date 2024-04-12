import db from "@/db"
import { CURD_SERVICE } from '@/utils/curd'
import { scriptLog } from '@/utils/log'
import { getAddressBalance } from '@/utils/wallet'
import Datastore from "nedb-promises"
import { app } from "electron"
import path from "path"
import axios from "axios"
import { batchRunFn } from '@/utils'
import { SocksProxyAgent } from "socks-proxy-agent"
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

const model = {
    name: {
        required: true,
        unique: true,
    },
    walletGroupId: {
        required: true
    },
    remark: ''
}

class A0GI_SERVICE extends CURD_SERVICE {
    constructor() {
        super(...arguments)
    }
    async list() {
        const data = await super.list(...arguments)
        const newList = await Promise.all(data.list.map(async v => {
            const walletGroupDetail = await db.wallet.findOne({ _id: v.walletGroupId })
            const walletDb = await initDb(walletGroupDetail.dbid)
            const walletNum = await walletDb.count()
            return { ...walletGroupDetail, walletGroupName: walletGroupDetail.name, walletNum, ...v }
        }))
        return { ...data, list: newList }
    }
    faucet = async (dbid, concurrencyLimit = 5) => {
        const system_setting = await db.system_setting.findOne({ type: "system_setting" })
        if (!system_setting.twoCaptchaApi || !system_setting.socks5Api) {
            throw new Error("socks5Api 或 twoCaptchaApi 不存在。")
        }
        solver = new Captcha.Solver(system_setting.twoCaptchaApi)
        socks5ApiUrl = system_setting.socks5Api
        const walletDb = await initDb(dbid)
        const wallets = await walletDb.find({}).limit()
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
                await this.getFaucet(wallet.address)
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
                scriptLog(`成功${successCount}个，跳过${jumpCount}个，失败${faildCount}个`)
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
    getBalance = async (dbid) => {
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

    getFaucet = async (address) => {
        const proxy = await axios.get(socks5ApiUrl).then(res => res.data)
        scriptLog(`获取动态ip成功： ${proxy}，测试代理ip连接`)
        await this.testProxy(proxy)
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

    testProxy = async (proxy) => {
        // 测试网站地址
        const testUrl = 'https://httpbin.org/get';
        return axios.get(testUrl, {
            httpsAgent: new SocksProxyAgent(`socks5://${proxy}`),
        }).catch(error => {
            throw new Error(`代理连接失败: socks5://${proxy}`)
        });
    }

}
const initDb = async (dbid) => {
    console.log(dbid)
    const basePath = app.getPath("userData")
    const dbPath = path.join(basePath, "nedb/wallet")
    return Datastore.create({
        autoload: true,
        filename: path.join(dbPath, `${dbid}.db`),
    })
}
export default new A0GI_SERVICE(model, db.a0gi)
