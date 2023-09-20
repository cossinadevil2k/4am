import http from "@/utils/http"
import { v4 as uuid } from "uuid"

export function runScript(scriptName, params) {
  return http({
    url: `/run-script/${scriptName}`,
    method: "get",
    params: {
      id: uuid(),
      ...params,
    },
  })
}
export function stopScript(id) {
  return http({
    url: `/stop-script/${id}`,
    method: "get",
  })
}
