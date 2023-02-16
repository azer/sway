import "dotenv/config";
import { app, BrowserWindow, session, dialog } from "electron";
//import * as isDev from "electron-is-dev";
import * as path from "path";

import { autoUpdater } from "electron-updater";

const isDev = !app.isPackaged;

autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "debug";

autoUpdater.setFeedURL({
  provider: "generic",
  url: "http://downloads.sway.so/releases/",
});

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

//let win: BrowserWindow | null = null;
let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 650,
    title: "Sway",
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 20, y: 12 },
    transparent: true,
    icon: "file:///" + __dirname + "/../priv/static/images/logo.ico",
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:4000/");
  } else {
    // 'build/index.html'
    win.loadURL(`https://sway.so`);
  }

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "../", "node_modules", ".bin", "electron"),
      forceHardReset: true,
      hardResetMethod: "exit",
    });

    const devtools = require("electron-devtools-installer");
    // DevTools
    devtools
      .default(devtools.REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log("An error occurred: ", err));
  }

  if (isDev) {
    //win.webContents.openDevTools()
  }
}

app.on("ready", () => createWindow());

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  return;
  const devtoolsStr = (process.env.DEVTOOLS_EXTENSIONS || "").trim();

  if (!devtoolsStr) return;

  const devtoolsExtensions = devtoolsStr.split(/\s*,\s*/);

  await Promise.all(
    devtoolsExtensions.map((path) => session.defaultSession.loadExtension(path))
  );

  setInterval(() => autoUpdater.checkForUpdates(), 600000);
});
