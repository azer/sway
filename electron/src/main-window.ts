import { BrowserWindow, shell } from "electron";
import log from "electron-log";
import { isDev, swayPath } from "./utils";
import { staticFilePath } from "./utils";

let mainWindow: BrowserWindow | null = null;

export function getMainWindow() {
  if (mainWindow.isDestroyed()) {
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
      nodeIntegration: true,
      contextIsolation: false,
      autoplayPolicy: "no-user-gesture-required",
      partition: "persist:sway",
    },
  });

  mainWindow.setMinimumSize(800, 600);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadURL(swayPath("login"));

  // mainWindow.on("closed", () => (mainWindow = null));

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    /*require("electron-reload")(__dirname, {
      electron: path.join(__dirname, "../", "node_modules", ".bin", "electron"),
      forceHardReset: true,
      hardResetMethod: "exit",
    });*/

    const devtools = require("electron-devtools-installer");
    // DevTools
    devtools
      .default(devtools.REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log("An error occurred: ", err));

    //win.webContents.openDevTools()
  }
}
