import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ipc", {
  send: ipcRenderer.send,
  on: (channel, listener) => ipcRenderer.on(channel, listener),
});
