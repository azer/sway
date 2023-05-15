import { BrowserWindow } from "electron";
import log from "electron-log";
import { getMainWindow } from "./main-window";
import { messageMainWindow } from "./messaging";
import { htmlPath, isDev } from "./utils";

const size = {
  width: 175,
  height: 350,
};

export let pipWindow: BrowserWindow | null = null;

export function getPipWindow() {
  if (pipWindow.isDestroyed()) {
    createPipWindow(getPipWindowPosition(getMainWindow()));
  }

  return pipWindow;
}

export function createPipWindow(position: { x: number; y: number }) {
  log.info("Creating PIP window");

  pipWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    x: position.x,
    y: position.y,
    fullscreenable: false,
    resizable: true,
    maximizable: false,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false,
      experimentalFeatures: true,
    },
  });

  pipWindow.setMinimumSize(size.width, size.height);

  pipWindow.on("show", () => {
    messageMainWindow({ isPipWindowVisible: true });
  });

  pipWindow.on("hide", () => {
    messageMainWindow({ isPipWindowVisible: false });
  });

  pipWindow.setVisibleOnAllWorkspaces(true);
  pipWindow.loadURL(htmlPath("pip-window.html"));

  if (isDev) {
    pipWindow.webContents.openDevTools();
  }
}

export function getPipWindowPosition(mainWindow: BrowserWindow): {
  x: number;
  y: number;
} {
  const mainWindowBounds = mainWindow.getBounds();

  return {
    x: mainWindowBounds.x + mainWindowBounds.width + 50,
    y: mainWindowBounds.y + mainWindowBounds.height - size.height,
  };
}
