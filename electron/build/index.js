var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main-window.ts
var import_electron2 = require("electron");
var import_electron_log2 = __toESM(require("electron-log"));
var import_path = require("path");

// src/utils.ts
var import_electron = require("electron");
var import_electron_log = __toESM(require("electron-log"));
var path = __toESM(require("path"));
var isDev = !import_electron.app.isPackaged;
var assetsDir = path.join(__dirname, "../assets");
function assetPath(filename) {
  return path.join(assetsDir, filename);
}
function htmlPath(filename) {
  return "file://" + path.join(__dirname, filename);
}
function staticFilePath(filename) {
  return "file://" + path.join(__dirname, "../priv/static", filename);
}
function loadExtensions() {
  const devtoolsStr = (process.env.DEVTOOLS_EXTENSIONS || "").trim();
  if (!devtoolsStr)
    return import_electron_log.default.info("No extensions to load");
  const devtoolsExtensions = devtoolsStr.split(/\s*,\s*/);
  Promise.all(
    devtoolsExtensions.map((path2) => import_electron.session.defaultSession.loadExtension(path2))
  ).then(() => {
    import_electron_log.default.info("Extensions loaded");
  });
}
function swayPath(dir) {
  if (isDev) {
    return "http://" + path.join("localhost:4000", dir);
  } else {
    return "https://" + path.join("sway.so", dir);
  }
}

// src/main-window.ts
var mainWindow = null;
var quitting = false;
function getMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    import_electron_log2.default.info("Main window is destroyed, recreating");
    createMainWindow();
  }
  return mainWindow;
}
function createMainWindow() {
  mainWindow = new import_electron2.BrowserWindow({
    width: 1e3,
    height: 750,
    title: "Sway",
    trafficLightPosition: { x: 12, y: 16 },
    titleBarStyle: "customButtonsOnHover",
    //transparent: true,
    backgroundColor: "#00000022",
    icon: staticFilePath("images/logo.ico"),
    webPreferences: {
      preload: (0, import_path.join)(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      autoplayPolicy: "no-user-gesture-required",
      partition: "persist:sway"
    }
  });
  mainWindow.setMinimumSize(800, 600);
  mainWindow.on("close", (event) => {
    if (quitting) {
      mainWindow = null;
    } else {
      import_electron_log2.default.info("Hide main window");
      event.preventDefault();
      mainWindow.hide();
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    import_electron2.shell.openExternal(url);
    return { action: "deny" };
  });
  import_electron_log2.default.info("Create main window", swayPath("login"));
  mainWindow.loadURL(swayPath("login"));
  import_electron2.app.on("before-quit", () => quitting = true);
  mainWindow.on("closed", (event) => {
  });
}

// src/tray.ts
var import_electron4 = require("electron");
var import_electron_log4 = __toESM(require("electron-log"));

// ../assets/js/lib/log.ts
var c = 0;
var colors = ["red", "blue", "green", "purple", "orange"];
function logger(name) {
  const color = colors[c++ % colors.length];
  return {
    info,
    error
  };
  function info(msg, ...props) {
    log9(console.info, msg, props);
  }
  function error(msg, ...props) {
    log9(console.error, msg, props);
  }
  function log9(fn, msg, props) {
    const args = [
      `%c<${name}>%c ${msg}`,
      `color: ${color};font-weight: bold;`,
      "color: inherit"
    ];
    if (props.length > 1) {
      args.push(...props.slice(0, -1));
      args.push(props[props.length - 1]);
    } else if (props.length > 0) {
      args.push(props[0]);
    }
    fn.apply(console, args);
  }
}

// ../assets/js/lib/electron.ts
var log3 = logger("electron");
var isNode = isRunningInElectron() && (process == null ? void 0 : process.type) !== "renderer";
var ipcRenderer = typeof window !== "undefined" ? window.electronIpcRenderer : null;
var isElectron = !isNode && /electron/i.test(window.navigator.userAgent);
var messageMainWindow = createMessageFn("main-window" /* Main */);
var messageTrayWindow = createMessageFn("tray-window" /* Tray */);
var messagePipWindow = createMessageFn("pip" /* Pip */);
var messageWindowManager = createMessageFn(
  "window-manager" /* WindowManager */
);
function sendMessage(chan, message) {
  if (isNode)
    throw Error("Not implemented for Node");
  if (!isElectron)
    return;
  if (!ipcRenderer) {
    log3.error("ipcRenderer is not available to renderer process.");
    return;
  }
  log3.info("Sending message", chan, message);
  ipcRenderer.send(chan, message);
}
function createMessageFn(target) {
  return (payload) => {
    return sendMessage("message", {
      target,
      payload
    });
  };
}
function isRunningInElectron() {
  return typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.electron !== "undefined";
}

// src/messaging.ts
var import_electron_log3 = __toESM(require("electron-log"));
var messageMainWindow2 = createMessageFn2(
  getMainWindow,
  "main-window" /* Main */
);
var messageTrayWindow2 = createMessageFn2(
  getTrayWindow,
  "tray-window" /* Tray */
);
function createMessageFn2(windowFn, target) {
  return (payload) => {
    import_electron_log3.default.info("Send message");
    return windowFn().webContents.send("message", {
      target,
      payload
    });
  };
}

// src/tray.ts
var import_path2 = require("path");
var trayWindow = null;
var trayButton = null;
function getTrayWindow() {
  if (trayWindow.isDestroyed()) {
    createTrayWindow();
  }
  return trayWindow;
}
function createTrayWindow() {
  import_electron_log4.default.info("Creating tray window");
  trayWindow = new import_electron4.BrowserWindow({
    width: 300,
    height: 350,
    fullscreenable: false,
    resizable: false,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: (0, import_path2.join)(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });
  trayWindow.loadURL(htmlPath("tray-window.html"));
  trayWindow.on("blur", () => {
    if (trayWindow.webContents.isDevToolsOpened())
      return;
    trayWindow.hide();
    messageMainWindow2({
      isTrayWindowVisible: false
    });
  });
  if (isDev) {
    trayWindow.webContents.openDevTools();
  }
}
function createTrayButton() {
  trayButton = new import_electron4.Tray(assetPath("tray_icon_emptyTemplate.png"));
  trayButton.setToolTip("Sway");
  trayButton.on("click", () => {
    import_electron_log4.default.info("Show tray window");
    if (trayWindow.isDestroyed()) {
      createTrayWindow();
    }
    if (trayWindow.isVisible()) {
      trayWindow.hide();
      messageMainWindow2({ isTrayWindowVisible: false });
    } else {
      const position = getTrayWindowPosition();
      trayWindow.setPosition(position.x, position.y, false);
      trayWindow.setVisibleOnAllWorkspaces(true);
      trayWindow.show();
      trayWindow.focus();
      messageMainWindow2({ isTrayWindowVisible: true });
    }
  });
  return trayButton;
}
function getTrayWindowPosition() {
  const windowBounds = trayWindow.getBounds();
  const trayBounds = trayButton.getBounds();
  console.log("window bounds:", windowBounds);
  console.log("tray bounds:", trayBounds);
  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );
  const y = Math.round(trayBounds.y);
  console.log("tray window position: ", x, y);
  return { x, y };
}
function setTray(title, tooltip, image) {
  import_electron_log4.default.info("Set tray. Title: ", title, " Tooltip:", tooltip, " Image:", image);
  if (!trayButton) {
    createTrayButton();
  }
  trayButton.setImage(assetPath(image));
  trayButton.setTitle(title);
  trayButton.setToolTip(tooltip);
}

// src/main.ts
var import_electron7 = require("electron");

// src/auto-updater.ts
var import_electron5 = require("electron");
var import_electron_updater = require("electron-updater");
var import_electron_log5 = __toESM(require("electron-log"));
function checkForUpdates() {
  setInterval(() => import_electron_updater.autoUpdater.checkForUpdates(), 6e5);
}
function setupAutoUpdater() {
  import_electron_updater.autoUpdater.logger = import_electron_log5.default;
  import_electron_updater.autoUpdater.logger.transports.file.level = "debug";
  import_electron_updater.autoUpdater.setFeedURL({
    provider: "generic",
    url: "http://downloads.sway.so/releases/"
  });
  import_electron_updater.autoUpdater.checkForUpdatesAndNotify();
  import_electron_updater.autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
    if (!getMainWindow().isFocused())
      return;
    const dialogOpts = {
      type: "info",
      buttons: ["Restart", "Later"],
      title: "Application Update",
      message: process.platform === "win32" ? releaseNotes : releaseName,
      detail: "A new version has been downloaded. Restart the application to apply the updates."
    };
    import_electron5.dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0)
        import_electron_updater.autoUpdater.quitAndInstall();
    });
  });
}

// src/main.ts
var import_electron_log7 = __toESM(require("electron-log"));

// src/pip.ts
var import_electron6 = require("electron");
var import_electron_log6 = __toESM(require("electron-log"));
var import_path3 = require("path");
var size = {
  width: 175,
  height: 350
};
var pipWindow = null;
function getPipWindow() {
  if (pipWindow.isDestroyed()) {
    createPipWindow(getPipWindowPosition(getMainWindow()));
  }
  return pipWindow;
}
function createPipWindow(position) {
  import_electron_log6.default.info("Creating PIP window");
  pipWindow = new import_electron6.BrowserWindow({
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
      preload: (0, import_path3.join)(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false,
      experimentalFeatures: true
    }
  });
  pipWindow.setMinimumSize(size.width, size.height);
  pipWindow.on("show", () => {
    messageMainWindow2({ isPipWindowVisible: true });
  });
  pipWindow.on("hide", () => {
    messageMainWindow2({ isPipWindowVisible: false });
  });
  pipWindow.setVisibleOnAllWorkspaces(true);
  pipWindow.loadURL(htmlPath("pip-window.html"));
  if (isDev) {
    pipWindow.webContents.openDevTools();
  }
}
function getPipWindowPosition(mainWindow2) {
  const mainWindowBounds = mainWindow2.getBounds();
  return {
    x: mainWindowBounds.x + mainWindowBounds.width + 50,
    y: mainWindowBounds.y + mainWindowBounds.height - size.height
  };
}

// src/main.ts
import_electron_log7.default.initialize({ preload: true });
setupAutoUpdater();
import_electron7.ipcMain.handle("get-sources", () => {
  import_electron_log7.default.info("Handle get-sources call");
  const access = import_electron7.systemPreferences.getMediaAccessStatus("screen");
  import_electron_log7.default.info("Access status:", access);
  return new Promise((resolve, reject) => {
    import_electron7.desktopCapturer.getSources({ types: ["window", "screen"], thumbnailSize: { width: 800, height: 600 } }).then((sources) => resolve(sources.map((source) => __spreadProps(__spreadValues({}, source), {
      thumbnail: source.thumbnail.toDataURL()
    })))).catch(reject);
  });
});
import_electron7.app.on("ready", () => {
  import_electron_log7.default.info("Ready");
  createMainWindow();
  createTrayWindow();
  createPipWindow(getPipWindowPosition(getMainWindow()));
  getMainWindow().on("blur", () => {
    import_electron_log7.default.info("Blur, show pip window");
    messageMainWindow2({ isMainWindowFocused: false });
  });
  getMainWindow().on("show", () => {
    import_electron_log7.default.info("Show main window, hide pip window");
    messageMainWindow2({ isMainWindowFocused: true });
  });
  getMainWindow().on("focus", () => {
    import_electron_log7.default.info("Focus main window, hide pip window");
    messageMainWindow2({ isMainWindowFocused: true });
  });
  const setProtocol = import_electron7.app.setAsDefaultProtocolClient("sway");
  import_electron_log7.default.info("Set as default protocol client", setProtocol);
});
import_electron7.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    import_electron_log7.default.info("Quit");
    import_electron7.app.quit();
  }
});
import_electron7.app.on("activate", () => {
  getMainWindow().show();
});
import_electron7.app.whenReady().then(() => __async(exports, null, function* () {
  if (isDev) {
    import_electron_log7.default.info("Load extensions");
    loadExtensions();
  }
  checkForUpdates();
}));
import_electron7.app.on("open-url", (event, url) => {
  const u = new URL(url);
  if (u.protocol === "sway:") {
    event.preventDefault();
    import_electron_log7.default.info("Opening url", url);
    getMainWindow().loadURL(
      swayPath(`desktop/auth/start?key=${u.searchParams.get("key")}`)
    );
  }
});
import_electron7.ipcMain.on(
  "message",
  (event, parsed) => {
    import_electron_log7.default.info("Receive message");
    const message = parsed;
    let window2 = null;
    switch (parsed.target) {
      case "window-manager" /* WindowManager */:
        handleMessages(parsed);
        break;
      case "main-window" /* Main */:
        window2 = getMainWindow();
        break;
      case "tray-window" /* Tray */:
        window2 = getTrayWindow();
        break;
      case "pip" /* Pip */:
        window2 = getPipWindow();
        break;
    }
    if (window2) {
      try {
        window2.webContents.send("message", message);
      } catch (err) {
        console.error(
          "Can not direct message. Target: " + parsed.target + " Message:" + message
        );
        import_electron_log7.default.error(
          "Can not direct message. Target: " + parsed.target + " Message:" + message
        );
      }
    }
  }
);
function handleMessages(message) {
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
  import_electron_log7.default.error("Unhandled message", JSON.stringify(message));
}
function requestCameraAccess() {
  import_electron7.systemPreferences.askForMediaAccess("camera").then((hasCameraAccess) => {
    import_electron_log7.default.info("Camera access?", hasCameraAccess);
    messageMainWindow2({ hasCameraAccess });
  }).catch((err) => import_electron_log7.default.error("Error", err));
}
function requestMicAccess() {
  import_electron7.systemPreferences.askForMediaAccess("microphone").then((hasMicAccess) => {
    import_electron_log7.default.info("Mic access?", hasMicAccess);
    messageMainWindow2({ hasMicAccess });
  }).catch((err) => import_electron_log7.default.error("Error", err));
}
function requestScreenAccess() {
  import_electron_log7.default.info("Request access for media access");
  import_electron7.shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture");
}
