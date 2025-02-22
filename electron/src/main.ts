import { createMainWindow, getMainWindow } from "./main-window";
import { createTrayWindow, getTrayWindow, setTray } from "./tray";
import {
  app,
  BrowserWindow,
  ipcMain,
  systemPreferences,
  desktopCapturer,
  shell,
} from "electron";
import { checkForUpdates, quitAndInstallNewRelease } from "./auto-updater";
import log from "electron-log";
import { isDev, loadExtensions, swayPath } from "./utils";
import { ElectronMessage, ElectronWindow } from "../../assets/js/lib/electron";
import { createPipWindow, getPipWindow, getPipWindowPosition } from "./pip";
import { messageMainWindow } from "./messaging";
import { setupMenu } from "./menu";

log.initialize({ preload: true });

ipcMain.handle("get-sources", () => {
  log.info("Handle get-sources call");

  const access = systemPreferences.getMediaAccessStatus("screen");
  log.info("Access status:", access);

  return new Promise((resolve, reject) => {
    desktopCapturer
      .getSources({
        types: ["window", "screen"],
        thumbnailSize: { width: 800, height: 600 },
      })
      .then((sources) =>
        resolve(
          sources.map((source) => ({
            ...source,
            thumbnail: source.thumbnail.toDataURL(),
          }))
        )
      )
      .catch(reject);
  });
});

app.on("ready", () => {
  log.info("Ready");

  createMainWindow();
  createTrayWindow();
  createPipWindow(getPipWindowPosition(getMainWindow()));
  setupMenu();

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

  const setProtocol = app.setAsDefaultProtocolClient("sway");
  log.info("Set as default protocol client", setProtocol);

  //
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    log.info("Quit");
    app.quit();
  }
});

app.on("activate", () => {
  getMainWindow().show();
});

app.whenReady().then(async () => {
  if (isDev) {
    log.info("Load extensions");
    loadExtensions();
  }

  checkForUpdates();
});

app.on("open-url", (event, url) => {
  const u = new URL(url);

  if (u.protocol === "sway:") {
    event.preventDefault();

    log.info("Opening url", url);

    getMainWindow().loadURL(
      swayPath(`desktop/auth/start?key=${u.searchParams.get("key")}`)
    );
  }
});

ipcMain.on(
  "message",
  (event: Electron.IpcMainEvent, parsed: ElectronMessage) => {
    log.info("Receive message");

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

  if (message.payload.requestCameraAccess) {
    requestCameraAccess();
    return;
  }

  if (message.payload.requestMicAccess) {
    requestMicAccess();
    return;
  }

  if (message.payload.requestScreenAccess) {
    requestScreenAccess();
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

  if (message.payload.quitAndInstallNewRelease) {
    quitAndInstallNewRelease();
    return;
  }

  log.error("Unhandled message", JSON.stringify(message));
}

function requestCameraAccess() {
  systemPreferences
    .askForMediaAccess("camera")
    .then((hasCameraAccess) => {
      log.info("Camera access?", hasCameraAccess);
      messageMainWindow({ hasCameraAccess });
    })
    .catch((err) => log.error("Error", err));
}

function requestMicAccess() {
  systemPreferences
    .askForMediaAccess("microphone")
    .then((hasMicAccess) => {
      log.info("Mic access?", hasMicAccess);
      messageMainWindow({ hasMicAccess });
    })
    .catch((err) => log.error("Error", err));
}

function requestScreenAccess() {
  log.info("Request access for media access");
  shell.openExternal(
    "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
  );
  /*systemPreferences
    .askForMediaAccess("screen")
    .then((hasScreenAccess) => {
      log.info("Screen access?", hasScreenAccess);
      messageMainWindow({ hasScreenAccess });
    })
    .catch((err) => log.error("Error", err));*/
}
