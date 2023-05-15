import { dialog } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { getMainWindow } from "./main-window";

let downloadedUpdate: null | any = null;

export function checkForUpdates() {
  setInterval(() => autoUpdater.checkForUpdates(), 600000);
}

export function setupAutoUpdater() {
  autoUpdater.logger = log;

  // @ts-ignore
  autoUpdater.logger.transports.file.level = "debug";

  autoUpdater.setFeedURL({
    provider: "generic",
    url: "http://downloads.sway.so/releases/",
  });

  autoUpdater.checkForUpdatesAndNotify();

  // @ts-ignore
  autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
    if (!getMainWindow().isFocused()) return;

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
