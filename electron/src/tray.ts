import { app, BrowserWindow, Tray } from "electron";
import log from "electron-log";
import { isDev, assetPath, htmlPath } from "./utils";
import { messageMainWindow } from "./messaging";

export let trayWindow: BrowserWindow | null = null;
export let trayButton: Tray | null = null;

export function getTrayWindow() {
  if (trayWindow.isDestroyed()) {
    createTrayWindow();
  }

  return trayWindow;
}

export function createTrayWindow() {
  log.info("Creating tray window");

  trayWindow = new BrowserWindow({
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

  trayWindow.loadURL(htmlPath("tray-window.html"));

  // Hide the window when it loses focus
  trayWindow.on("blur", () => {
    if (trayWindow.webContents.isDevToolsOpened()) return;

    trayWindow.hide();

    messageMainWindow({
      isTrayWindowVisible: false,
    });

    //if (!trayWindow.webContents.isDevToolsOpened()) {
    //}
  });

  /*if (isDev) {
    trayWindow.webContents.openDevTools();
  }*/
}

export function createTrayButton() {
  trayButton = new Tray(assetPath("tray_icon_emptyTemplate.png"));
  trayButton.setToolTip("Sway");

  trayButton.on("click", () => {
    log.info("Show tray window");

    if (trayWindow.isDestroyed()) {
      createTrayWindow();
    }

    if (trayWindow.isVisible()) {
      trayWindow.hide();
      messageMainWindow({ isTrayWindowVisible: false });
    } else {
      const position = getTrayWindowPosition();
      trayWindow.setPosition(position.x, position.y, false);
      trayWindow.setVisibleOnAllWorkspaces(true);
      trayWindow.show();
      trayWindow.focus();
      messageMainWindow({ isTrayWindowVisible: true });
    }
  });

  return trayButton;
}

function getTrayWindowPosition() {
  const windowBounds = trayWindow.getBounds();
  const trayBounds = trayButton.getBounds();

  console.log("window bounds:", windowBounds);
  console.log("tray bounds:", trayBounds);

  // Center window horizontally below the tray icon
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y);

  console.log("tray window position: ", x, y);

  return { x: x, y: y };
}

export function setTray(title: string, tooltip: string, image: string) {
  log.info("Set tray. Title: ", title, " Tooltip:", tooltip, " Image:", image);
  if (!trayButton) {
    createTrayButton();
  }

  trayButton.setImage(assetPath(image));
  trayButton.setTitle(title);
  trayButton.setToolTip(tooltip);
}
