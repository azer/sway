import "dotenv/config";
import { app, BrowserWindow, session } from "electron";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import * as isDev from "electron-is-dev";
import * as path from "path";

//let win: BrowserWindow | null = null;
let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 20, y: 12 },
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:4000/");
  } else {
    // 'build/index.html'
    win.loadURL(`file://${__dirname}/../index.html`);
  }

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require("electron-reload")(__dirname, {
      electron: path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        ".bin",
        "electron"
      ),
      forceHardReset: true,
      hardResetMethod: "exit",
    });
  }

  // DevTools
  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));

  if (isDev) {
    //win.webContents.openDevTools()
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  const devtoolsStr = (process.env.DEVTOOLS_EXTENSIONS || "").trim();

  if (!devtoolsStr) return;

  const devtoolsExtensions = devtoolsStr.split(/\s*,\s*/);

  await Promise.all(
    devtoolsExtensions.map((path) => session.defaultSession.loadExtension(path))
  );
});
