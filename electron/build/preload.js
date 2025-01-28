const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronDesktopCapturer", {
  getSources: () => ipcRenderer.invoke("get-sources"),
});

contextBridge.exposeInMainWorld("electronIpcRenderer", {
  send: (chan, payload) => ipcRenderer.send(chan, payload),
  on: (chan, cb) => ipcRenderer.on(chan, cb),
  removeListener: (chan, cb) => ipcRenderer.removeListener(chan, cb),
});

contextBridge.exposeInMainWorld("process", {
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
});
