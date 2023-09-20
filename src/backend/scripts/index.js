import StoppableScript from "@/utils/stoppableScript"
import suiQuest2 from "@/scripts/suiQuest2"
import exportWallet from "@/scripts/exportWallet"
import sendToChild from "@/scripts/sendToChild"
import sendToFather from "@/scripts/sendToFather"
import sui2 from "@/scripts/sui2"
import overWallet from "@/scripts/OverWallet"
import test from '@/scripts/test'
export default {
  suiQuest2: new StoppableScript(suiQuest2),
  exportWallet: new StoppableScript(exportWallet),
  sendToChild: new StoppableScript(sendToChild),
  sendToFather: new StoppableScript(sendToFather),
  sui2: new StoppableScript(sui2),
  overWallet: new StoppableScript(overWallet),
  test: new StoppableScript(test),
}
