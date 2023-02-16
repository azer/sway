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
const isDev = !import_electron.app.isPackaged;
import_electron_updater.autoUpdater.logger = require("electron-log");
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
let win = null;
function createWindow() {
  win = new import_electron.BrowserWindow({
    width: 800,
    height: 600,
    title: "Sway",
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 20, y: 12 },
    transparent: true,
    icon: "file:///" + __dirname + "/../priv/static/images/logo.ico",
    webPreferences: {
      nodeIntegration: true
    }
  });
  if (isDev) {
    win.loadURL("http://localhost:4000/");
  } else {
    win.loadURL(`https://sway.so`);
  }
  win.on("closed", () => win = null);
  if (isDev) {
    require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "../", "node_modules", ".bin", "electron"),
      forceHardReset: true,
      hardResetMethod: "exit"
    });
    const devtools = require("electron-devtools-installer");
    devtools.default(devtools.REACT_DEVELOPER_TOOLS).then((name) => console.log(`Added Extension:  ${name}`)).catch((err) => console.log("An error occurred: ", err));
  }
  if (isDev) {
  }
}
import_electron.app.on("ready", () => createWindow());
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron.app.quit();
  }
});
import_electron.app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
import_electron.app.whenReady().then(async () => {
  return;
  const devtoolsStr = (process.env.DEVTOOLS_EXTENSIONS || "").trim();
  if (!devtoolsStr)
    return;
  const devtoolsExtensions = devtoolsStr.split(/\s*,\s*/);
  await Promise.all(
    devtoolsExtensions.map((path2) => import_electron.session.defaultSession.loadExtension(path2))
  );
  setInterval(() => import_electron_updater.autoUpdater.checkForUpdates(), 6e5);
});
