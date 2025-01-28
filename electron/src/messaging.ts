import { getMainWindow } from "./main-window";
import { getTrayWindow } from "./tray";
import { ElectronPayload, ElectronWindow } from "../../assets/js/lib/electron";
import { BrowserWindow } from "electron";
import log from "electron-log";

export const messageMainWindow = createMessageFn(
  getMainWindow,
  ElectronWindow.Main
);

export const messageTrayWindow = createMessageFn(
  getTrayWindow,
  ElectronWindow.Tray
);

export function createMessageFn(
  windowFn: () => BrowserWindow,
  target: ElectronWindow
): (p: ElectronPayload) => void {
  return (payload: ElectronPayload) => {
    log.info("Send message");
    return windowFn().webContents.send("message", {
      target,
      payload,
    });
  };
}
