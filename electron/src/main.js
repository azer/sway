import "dotenv/config";
import { app, BrowserWindow, session, dialog, Tray, ipcMain } from "electron";
//import * as isDev from "electron-is-dev";
import * as path from "path";

import { autoUpdater } from "electron-updater";
import log from "electron-log";

let mainWindow = null;
let trayWindow = null;
let tray = null;

const isDev = !app.isPackaged;
const assetsDir = path.join(__dirname, "../assets");

log.initialize({ preload: true });
setupAutoUpdater();

//let win: BrowserWindow | null = null;

app.on("ready", () => {
  mainWindow = createMainWindow();
  trayWindow = createTrayWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.whenReady().then(async () => {
  if (isDev) {
    const devtoolsStr = (process.env.DEVTOOLS_EXTENSIONS || "").trim();

    if (!devtoolsStr) return;

    const devtoolsExtensions = devtoolsStr.split(/\s*,\s*/);

    await Promise.all(
      devtoolsExtensions.map((path) =>
        session.defaultSession.loadExtension(path)
      )
    );
  }

  setInterval(() => autoUpdater.checkForUpdates(), 600000);
});

ipcMain.on("tray", (event, options) => {
  log.info("Setting tray", options);

  if (!tray) {
    tray = createTray();
  }

  const parsed = JSON.parse(options);
  tray.setImage(path.join(assetsDir, parsed.image));
  tray.setTitle(parsed.title);
  tray.setToolTip(parsed.tooltip);
});

ipcMain.on("tray-window", (event, msg) => {
  trayWindow.webContents.send("tray-window", msg);
});

ipcMain.on("commands", (event, msg) => {
  const parsed = JSON.parse(msg);
  switch (parsed.command) {
    case "show-main-window":
      trayWindow.hide();
      mainWindow.show();
      break;
    case "hide-tray-window":
      trayWindow.hide();
      break;
  }
});

function createTray() {
  const tray = new Tray(path.join(assetsDir, "tray_icon_emptyTemplate.png"));
  tray.setToolTip("Sway");

  tray.on("click", () => {
    log.info("Show tray window");
    if (trayWindow.isVisible()) {
      trayWindow.hide();
    } else {
      const position = getTrayWindowPosition();
      trayWindow.setPosition(position.x, position.y, false);
      trayWindow.setVisibleOnAllWorkspaces(true);
      trayWindow.show();
      trayWindow.focus();
    }
  });

  return tray;
}

function createTrayWindow() {
  log.info("Creating tray window");

  const win = new BrowserWindow({
    width: 300,
    height: 350,
    fullscreenable: false,
    resizable: false,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false,
    },
  });

  win.loadURL(`file://${path.join(__dirname, "tray-window.html")}`);

  // Hide the window when it loses focus
  win.on("blur", () => {
    if (!win.webContents.isDevToolsOpened()) {
      win.hide();
    }
  });

  if (isDev) {
    win.webContents.openDevTools();
  }

  return win;
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 650,
    title: "Sway",
    trafficLightPosition: { x: 12, y: 16 },
    titleBarStyle: "customButtonsOnHover",
    transparent: true,
    icon: "file:///" + __dirname + "/../priv/static/images/logo.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMinimumSize(800, 600);

  if (isDev) {
    win.loadURL("http://localhost:4000/login");
  } else {
    // 'build/index.html'
    win.loadURL(`https://sway.so/login`);
  }

  win.on("closed", () => (mainWindow = null));

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

    //win.webContents.openDevTools()
  }

  return win;
}

function setupAutoUpdater() {
  autoUpdater.logger = log;
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
}

function getTrayWindowPosition() {
  const windowBounds = trayWindow.getBounds();
  const trayBounds = tray.getBounds();

  log.info("Window bounds:", windowBounds);
  log.info("Tray bounds:", trayBounds);

  // Center window horizontally below the tray icon
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y);

  log.info("tray window position: ", x, y);

  return { x: x, y: -20 };
}
