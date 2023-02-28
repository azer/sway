var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_config = require("dotenv/config");
var import_electron = require("electron");
var path = __toESM(require("path"));
var import_electron_updater = require("electron-updater");
var import_electron_log = __toESM(require("electron-log"));
let mainWindow = null;
let trayWindow = null;
let tray = null;
const isDev = !import_electron.app.isPackaged;
const assetsDir = path.join(__dirname, "../assets");
import_electron_log.default.initialize({ preload: true });
setupAutoUpdater();
import_electron.app.on("ready", () => {
  mainWindow = createMainWindow();
  trayWindow = createTrayWindow();
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
import_electron.app.whenReady().then(async () => {
  if (isDev) {
    const devtoolsStr = (process.env.DEVTOOLS_EXTENSIONS || "").trim();
    if (!devtoolsStr)
      return;
    const devtoolsExtensions = devtoolsStr.split(/\s*,\s*/);
    await Promise.all(
      devtoolsExtensions.map(
        (path2) => import_electron.session.defaultSession.loadExtension(path2)
      )
    );
  }
  setInterval(() => import_electron_updater.autoUpdater.checkForUpdates(), 6e5);
});
import_electron.ipcMain.on("tray", (event, options) => {
  import_electron_log.default.info("Setting tray", options);
  if (!tray) {
    tray = createTray();
  }
  const parsed = JSON.parse(options);
  tray.setImage(path.join(assetsDir, parsed.image));
  tray.setTitle(parsed.title);
  tray.setToolTip(parsed.tooltip);
});
import_electron.ipcMain.on("tray-window", (event, msg) => {
  trayWindow.webContents.send("tray-window", msg);
});
import_electron.ipcMain.on("commands", (event, msg) => {
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
  const tray2 = new import_electron.Tray(path.join(assetsDir, "tray_icon_emptyTemplate.png"));
  tray2.setToolTip("Sway");
  tray2.on("click", () => {
    import_electron_log.default.info("Show tray window");
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
  return tray2;
}
function createTrayWindow() {
  import_electron_log.default.info("Creating tray window");
  const win = new import_electron.BrowserWindow({
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
      backgroundThrottling: false
    }
  });
  win.loadURL(`file://${path.join(__dirname, "tray-window.html")}`);
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
  const win = new import_electron.BrowserWindow({
    width: 800,
    height: 650,
    title: "Sway",
    trafficLightPosition: { x: 12, y: 12 },
    titleBarStyle: "customButtonsOnHover",
    transparent: true,
    icon: "file:///" + __dirname + "/../priv/static/images/logo.ico",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.setMinimumSize(800, 600);
  if (isDev) {
    win.loadURL("http://localhost:4000/");
  } else {
    win.loadURL(`https://sway.so`);
  }
  win.on("closed", () => mainWindow = null);
  if (isDev) {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "../", "node_modules", ".bin", "electron"),
      forceHardReset: true,
      hardResetMethod: "exit"
    });
    const devtools = require("electron-devtools-installer");
    devtools.default(devtools.REACT_DEVELOPER_TOOLS).then((name) => console.log(`Added Extension:  ${name}`)).catch((err) => console.log("An error occurred: ", err));
  }
  return win;
}
function setupAutoUpdater() {
  import_electron_updater.autoUpdater.logger = import_electron_log.default;
  import_electron_updater.autoUpdater.logger.transports.file.level = "debug";
  import_electron_updater.autoUpdater.setFeedURL({
    provider: "generic",
    url: "http://downloads.sway.so/releases/"
  });
  import_electron_updater.autoUpdater.checkForUpdatesAndNotify();
  import_electron_updater.autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail: "A new version has been downloaded. Restart the application to apply the updates."
    };
    import_electron.dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0)
        import_electron_updater.autoUpdater.quitAndInstall();
    });
  });
}
function getTrayWindowPosition() {
  const windowBounds = trayWindow.getBounds();
  const trayBounds = tray.getBounds();
  import_electron_log.default.info("Window bounds:", windowBounds);
  import_electron_log.default.info("Tray bounds:", trayBounds);
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );
  const y = Math.round(trayBounds.y);
  import_electron_log.default.info("tray window position: ", x, y);
  return { x, y: -20 };
}
