const CREATED = 1
const CREDENTIALS = 2
const TOKEN = 3

export const EMAIL_STATUS_CONST = {
  CREATED,
  CREDENTIALS,
  TOKEN,
}
export const EMAIL_STATUS_TEXT = {
  [CREATED]: "需apikey",
  [CREDENTIALS]: "需token",
  [TOKEN]: "可用",
}
