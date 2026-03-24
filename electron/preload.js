const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("pinpointDesktop", {
  platform: process.platform
});
