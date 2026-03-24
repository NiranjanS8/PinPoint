const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;
let mainWindow = null;
let miniPlayerWindow = null;
let miniPlayerContentId = null;
let miniPlayerAlwaysOnTop = true;

function getRendererUrl() {
  return isDev
    ? "http://127.0.0.1:5173"
    : path.join(__dirname, "..", "frontend", "dist", "index.html");
}

function loadWindow(windowInstance) {
  if (isDev) {
    windowInstance.loadURL(getRendererUrl());
    return;
  }

  windowInstance.loadFile(getRendererUrl());
}

function attachExternalLinkHandling(windowInstance) {
  windowInstance.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function sendMiniPlayerContext() {
  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.webContents.send("desktop:mini-player-context", {
      windowType: "mini-player",
      contentId: miniPlayerContentId,
      alwaysOnTop: miniPlayerAlwaysOnTop
    });
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1200,
    minHeight: 760,
    title: "Pinpoint",
    backgroundColor: "#f8f8f8",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  attachExternalLinkHandling(mainWindow);
  loadWindow(mainWindow);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createMiniPlayerWindow(contentId) {
  miniPlayerContentId = contentId;

  if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
    miniPlayerWindow.show();
    miniPlayerWindow.focus();
    sendMiniPlayerContext();
    return;
  }

  miniPlayerWindow = new BrowserWindow({
    width: 420,
    height: 320,
    minWidth: 360,
    minHeight: 240,
    title: "Pinpoint Mini Player",
    backgroundColor: "#0f1115",
    autoHideMenuBar: true,
    alwaysOnTop: miniPlayerAlwaysOnTop,
    resizable: true,
    maximizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  attachExternalLinkHandling(miniPlayerWindow);
  loadWindow(miniPlayerWindow);

  miniPlayerWindow.webContents.on("did-finish-load", () => {
    sendMiniPlayerContext();
  });

  miniPlayerWindow.on("closed", () => {
    miniPlayerWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  ipcMain.handle("desktop:get-window-context", (event) => {
    if (miniPlayerWindow && event.sender.id === miniPlayerWindow.webContents.id) {
      return {
        windowType: "mini-player",
        contentId: miniPlayerContentId,
        alwaysOnTop: miniPlayerAlwaysOnTop
      };
    }

    return {
      windowType: "main",
      contentId: null,
      alwaysOnTop: false
    };
  });

  ipcMain.handle("desktop:open-mini-player", (_, payload) => {
    createMiniPlayerWindow(payload.contentId);
  });

  ipcMain.handle("desktop:open-full-view", (_, payload) => {
    const navigateToContent = () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("desktop:navigate-to-content", payload);
      }
    };

    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    }

    if (mainWindow) {
      if (mainWindow.webContents.isLoadingMainFrame()) {
        mainWindow.webContents.once("did-finish-load", navigateToContent);
      }
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
      if (!mainWindow.webContents.isLoadingMainFrame()) {
        navigateToContent();
      }
    }
  });

  ipcMain.handle("desktop:close-mini-player", () => {
    if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
      miniPlayerWindow.close();
    }
  });

  ipcMain.handle("desktop:toggle-mini-player-always-on-top", () => {
    miniPlayerAlwaysOnTop = !miniPlayerAlwaysOnTop;
    if (miniPlayerWindow && !miniPlayerWindow.isDestroyed()) {
      miniPlayerWindow.setAlwaysOnTop(miniPlayerAlwaysOnTop, "floating");
      miniPlayerWindow.focus();
    }

    return miniPlayerAlwaysOnTop;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
