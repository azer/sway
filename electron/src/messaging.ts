import { getMainWindow } from "./main-window";
import { getTrayWindow } from "./tray";
import { ElectronPayload, ElectronWindow } from "../../assets/js/lib/electron";
import { BrowserWindow } from "electron";

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
    return windowFn().webContents.send("message", {
      target,
      payload,
    });
  };
}
