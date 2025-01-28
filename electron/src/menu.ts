import { Menu, ipcMain, dialog, MenuItem } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

export function setupMenu() {
  const menu = Menu.getApplicationMenu();

  // Define the new menu item
  const menuItem = new MenuItem({
    label: "Check for Updates",
    click: () => {
      // The code to check for updates here
      autoUpdater.checkForUpdatesAndNotify().catch((err) => log.error(err));
    },
  });

  // Add the new menu item to the first submenu of the application menu
  menu.items[0].submenu.insert(1, menuItem);

  // Reset the application menu
  Menu.setApplicationMenu(menu);
}
