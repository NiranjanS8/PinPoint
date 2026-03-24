const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pinpointDesktop", {
  platform: process.platform,
  getWindowContext: () => ipcRenderer.invoke("desktop:get-window-context"),
  openMiniPlayer: (contentId) => ipcRenderer.invoke("desktop:open-mini-player", { contentId }),
  openFullView: (contentId) => ipcRenderer.invoke("desktop:open-full-view", { contentId }),
  closeMiniPlayer: () => ipcRenderer.invoke("desktop:close-mini-player"),
  toggleMiniPlayerAlwaysOnTop: () => ipcRenderer.invoke("desktop:toggle-mini-player-always-on-top"),
  onMiniPlayerContext: (callback) => {
    const listener = (_, payload) => callback(payload);
    ipcRenderer.on("desktop:mini-player-context", listener);
    return () => ipcRenderer.removeListener("desktop:mini-player-context", listener);
  },
  onNavigateToContent: (callback) => {
    const listener = (_, payload) => callback(payload);
    ipcRenderer.on("desktop:navigate-to-content", listener);
    return () => ipcRenderer.removeListener("desktop:navigate-to-content", listener);
  }
});
