const UNFINISHED = 1
const UNCLAIM = 2
const UNQUIZE = 3
const FINISHIED = 100

export const OVER_STATUS_CONST = {
  UNFINISHED,
  UNQUIZE,
  UNCLAIM,
  FINISHIED,
}
export const OVER_STATUS_TEXT = {
  [UNFINISHED]: "未完成",
  [UNCLAIM]: "可领分",
  [UNQUIZE]: "可答题",
  [FINISHIED]: "已领完",
}
