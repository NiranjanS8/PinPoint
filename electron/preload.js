const { contextBridge, shell } = require("electron");

contextBridge.exposeInMainWorld("pinpointDesktop", {
  openExternal: (url) => shell.openExternal(url)
});
