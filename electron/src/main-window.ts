import { app, BrowserWindow, shell } from "electron";
import log from "electron-log";
import { join as joinPath } from "path";
import { isDev, swayPath } from "./utils";
import { staticFilePath } from "./utils";

let mainWindow: BrowserWindow | null = null;
let quitting = false;

export function getMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    log.info("Main window is destroyed, recreating");
    createMainWindow();
  }

  return mainWindow;
}

export function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 750,
    title: "Sway",
    trafficLightPosition: { x: 12, y: 16 },
    titleBarStyle: "customButtonsOnHover",
    //transparent: true,
    backgroundColor: "#00000022",
    icon: staticFilePath("images/logo.ico"),
    webPreferences: {
      preload: joinPath(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      autoplayPolicy: "no-user-gesture-required",
      partition: "persist:sway",
    },
  });

  mainWindow.setMinimumSize(800, 600);
  mainWindow.on("close", (event) => {
    if (quitting) {
      //log.info("Close main window. Quitting ?", quitting);
      // mainWindow.close();
      mainWindow = null;
    } else {
      log.info("Hide main window");
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  log.info("Create main window", swayPath("login"));

  mainWindow.loadURL(swayPath("login"));

  app.on("before-quit", () => (quitting = true));

  mainWindow.on("closed", (event) => {
    //log.info("Window closed", event);
  });

  // Hot Reloading
  /*if (isDev) {
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
  }*/
}

export function setQutting(isQuitting: boolean) {
  quitting = isQuitting;
}
