import { app, session } from "electron";
import log from "electron-log";
import * as path from "path";

export const isDev = !app.isPackaged;
const assetsDir = path.join(__dirname, "../assets");

export function assetPath(filename: string): string {
  return path.join(assetsDir, filename);
}

export function htmlPath(filename: string): string {
  return "file://" + path.join(__dirname, filename);
}

export function staticFilePath(filename: string): string {
  return "file://" + path.join(__dirname, "../priv/static", filename);
}

export function loadExtensions() {
  const devtoolsStr = (process.env.DEVTOOLS_EXTENSIONS || "").trim();

  if (!devtoolsStr) return log.info("No extensions to load");

  const devtoolsExtensions = devtoolsStr.split(/\s*,\s*/);

  Promise.all(
    devtoolsExtensions.map((path) => session.defaultSession.loadExtension(path))
  ).then(() => {
    log.info("Extensions loaded");
  });
}
