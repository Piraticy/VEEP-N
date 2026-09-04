const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("veepnDesktop", {
  connect: (request) => ipcRenderer.invoke("vpn:connect", request),
  disconnect: () => ipcRenderer.invoke("vpn:disconnect"),
  getRuntimeStatus: () => ipcRenderer.invoke("vpn:getRuntimeStatus"),
  listRelays: () => ipcRenderer.invoke("vpn:listRelays"),
  exportRelayConfig: (hostname) => ipcRenderer.invoke("vpn:exportRelayConfig", hostname)
});
