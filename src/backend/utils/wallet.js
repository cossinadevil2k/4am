const { ethers } = require('ethers');
import { scriptLog } from './log'
const ALCHEMY_0g_URL = 'https://rpc-testnet.0g.ai';
// 连接Sepolia测试网
const provider0g = new ethers.JsonRpcProvider(ALCHEMY_0g_URL)
// 生成助记词
export function generateMnemonic() {
  // 生成随机助记词
  const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16))
  return mnemonic;
}

// 根据助记词生成私钥、地址和公钥
export function mnemonicToWalletInfo(mnemonic) {
  // 创建HD钱包
  const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic)
  return {
    address: hdNode.address,
    publicKey: hdNode.publicKey,
    privateKey: hdNode.privateKey
  }
}

export async function getAddressBalance(address) {
  console.log(address)
  // 1. 查询vitalik在主网和Sepolia测试网的ETH余额
  const balance = await provider0g.getBalance(address);
  return ethers.formatEther(balance).toFixed(5)
}


export async function transfer(privateKey, to, amount) {
  // 利用私钥和provider创建wallet对象
  const wallet = new ethers.Wallet(privateKey, provider0g)
  const tx = {
    to,
    value: ethers.parseEther(amount)
  }
  //发送交易，获得收据
  const receipt = await wallet.sendTransaction(tx)
  await receipt.wait() // 等待链上确认交易
  console.log(receipt) // 打印交易详情
}