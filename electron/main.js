const { app, BrowserWindow, shell } = require("electron");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const isDev = !app.isPackaged;
let backendProcess;

function startBackendIfPackaged() {
  if (isDev) {
    return;
  }

  const jarPath = path.join(__dirname, "..", "backend", "target", "pinpoint-backend-1.0.0.jar");
  if (!fs.existsSync(jarPath)) {
    return;
  }

  backendProcess = spawn("java", ["-jar", jarPath], {
    cwd: path.join(__dirname, ".."),
    windowsHide: true
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#222831",
    title: "Pinpoint",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
    return;
  }

  mainWindow.loadFile(path.join(__dirname, "..", "frontend", "dist", "index.html"));
}

app.whenReady().then(() => {
  startBackendIfPackaged();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});
