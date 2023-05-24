import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { messageMainWindow } from "./messaging";

const HOUR = 60 * 60 * 1000;

let downloadedUpdate: null | any = null;

export function checkForUpdates() {
  setupAutoUpdater();
  setInterval(() => autoUpdater.checkForUpdates(), HOUR);
}

export function setupAutoUpdater() {
  autoUpdater.logger = log;

  // @ts-ignore
  autoUpdater.logger.transports.file.level = "debug";

  autoUpdater.setFeedURL({
    provider: "generic",
    url: "http://downloads.sway.so/releases/",
  });

  // autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates...");
    messageMainWindow({ checkingForUpdate: true });
  });

  autoUpdater.on("update-available", () => {
    log.info("Checking for updates...");
    messageMainWindow({ updateAvailable: true });
  });

  autoUpdater.on(
    "update-downloaded",
    // @ts-ignore
    (event: unknown, releaseNotes: string, releaseName: string) => {
      log.info("Update downloaded", releaseName, releaseNotes);

      messageMainWindow({
        newReleaseDownloaded: {
          name: releaseName || "",
          notes: releaseNotes || "",
        },
      });
    }
  );
}

export function quitAndInstallNewRelease() {
  log.info("Quit and install new release");
  autoUpdater.quitAndInstall();
}
