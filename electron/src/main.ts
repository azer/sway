import { createMainWindow, getMainWindow } from "./main-window";
import { createTrayWindow, getTrayWindow, setTray } from "./tray";
import { app, BrowserWindow, ipcMain, systemPreferences } from "electron";
import { checkForUpdates, setupAutoUpdater } from "./auto-updater";
import log from "electron-log";
import { isDev, loadExtensions } from "./utils";
import { ElectronMessage, ElectronWindow } from "../../assets/js/lib/electron";
import { createPipWindow, getPipWindow, getPipWindowPosition } from "./pip";
import { messageMainWindow } from "./messaging";

log.initialize({ preload: true });
setupAutoUpdater();

app.on("ready", () => {
  createMainWindow();
  createTrayWindow();
  createPipWindow(getPipWindowPosition(getMainWindow()));

  getMainWindow().on("blur", () => {
    log.info("Blur, show pip window");
    messageMainWindow({ isMainWindowFocused: false });
    //getPipWindow().show();
  });

  getMainWindow().on("show", () => {
    log.info("Show main window, hide pip window");
    messageMainWindow({ isMainWindowFocused: true });
    // getPipWindow().hide();
  });

  getMainWindow().on("focus", () => {
    log.info("Focus main window, hide pip window");
    messageMainWindow({ isMainWindowFocused: true });
    // getPipWindow().hide();
  });

  const microphone = systemPreferences.askForMediaAccess("microphone");
  const camera = systemPreferences.askForMediaAccess("camera");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (getMainWindow() === null) {
    createMainWindow();
  }
});

app.whenReady().then(async () => {
  if (isDev) {
    loadExtensions();
  }

  checkForUpdates();
});

ipcMain.on(
  "message",
  (event: Electron.IpcMainEvent, parsed: ElectronMessage) => {
    const message = parsed;
    //log.info("Received message", message.slice(0, 256));

    //const parsed = JSON.parse(message) as ElectronMessage;
    let window: BrowserWindow | null = null;

    switch (parsed.target) {
      case ElectronWindow.WindowManager:
        handleMessages(parsed);
        break;

      case ElectronWindow.Main:
        window = getMainWindow();
        break;

      case ElectronWindow.Tray:
        window = getTrayWindow();
        break;

      case ElectronWindow.Pip:
        window = getPipWindow();
        break;
    }

    if (window) {
      try {
        window.webContents.send("message", message);
      } catch (err) {
        console.error(
          "Can not direct message. Target: " +
            parsed.target +
            " Message:" +
            message
        );

        log.error(
          "Can not direct message. Target: " +
            parsed.target +
            " Message:" +
            message
        );
      }
    }
  }
);

function handleMessages(message: ElectronMessage) {
  if (message.payload.hideMainWindow) {
    getMainWindow().hide();
    return;
  }

  if (message.payload.hideTrayWindow) {
    getTrayWindow().hide();
    return;
  }

  if (message.payload.showTrayWindow) {
    getTrayWindow().show();
    return;
  }

  if (message.payload.showMainWindow) {
    getMainWindow().show();
    return;
  }

  if (message.payload.showPipWindow) {
    getPipWindow().show();
    return;
  }

  if (message.payload.hidePipWindow) {
    getPipWindow().hide();
    return;
  }

  if (message.payload.setTrayIcon) {
    setTray(
      message.payload.setTrayIcon.title,
      message.payload.setTrayIcon.tooltip,
      message.payload.setTrayIcon.image
    );
    return;
  }

  log.error("Unhandled message", JSON.stringify(message));
}
