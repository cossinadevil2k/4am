import http from "@/utils/http"
import { v4 as uuid } from "uuid"

export function runScript(data) {
  return http({
    url: `/run-script`,
    method: "post",
    data
  })
}
export function stopScript(data) {
  return http({
    url: `/stop-script`,
    method: "post",
    data
  })
}
