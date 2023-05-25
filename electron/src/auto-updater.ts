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
  log.info("Setting up auto updater");

  autoUpdater.logger = log;

  // @ts-ignore
  autoUpdater.logger.transports.file.level = "debug";

  autoUpdater.setFeedURL({
    provider: "generic",
    url: "https://downloads.sway.so/releases/",
  });

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates...");
    messageMainWindow({ checkingForUpdate: true });
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available...", info);
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

  autoUpdater.checkForUpdates();
}

export function quitAndInstallNewRelease() {
  log.info("Quit and install new release");
  autoUpdater.quitAndInstall();
}
