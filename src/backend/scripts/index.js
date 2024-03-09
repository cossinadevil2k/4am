import StoppableScript from "@/utils/stoppableScript"
import suiQuest2 from "@/scripts/suiQuest2"
import exportWallet from "@/scripts/exportWallet"
import sendToChild from "@/scripts/sendToChild"
import sendToFather from "@/scripts/sendToFather"
import sui3CreateAccount from "@/scripts/sui3CreateAccount"
import sui3Invite from "@/scripts/sui3Invite"
import sui2 from "@/scripts/sui2"
import sui3 from "@/scripts/sui3"
import overWallet from "@/scripts/OverWallet"
import test from '@/scripts/test'
import test2 from '@/scripts/test2'
import noss from '@/scripts/noss'
import nossMonitor from '@/scripts/nossMonitor'
import zeta from '@/scripts/zeta'
export default {
  suiQuest2: new StoppableScript(suiQuest2),
  exportWallet: new StoppableScript(exportWallet),
  sendToChild: new StoppableScript(sendToChild),
  sendToFather: new StoppableScript(sendToFather),
  sui3CreateAccount: new StoppableScript(sui3CreateAccount),
  sui3Invite: new StoppableScript(sui3Invite),
  sui2: new StoppableScript(sui2),
  sui3: new StoppableScript(sui3),
  overWallet: new StoppableScript(overWallet),
  test: new StoppableScript(test),
  test2: new StoppableScript(test2),
  noss: new StoppableScript(noss),
  nossMonitor: new StoppableScript(nossMonitor),
  zeta: new StoppableScript(zeta),
}
