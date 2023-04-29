import { logger } from './log'

export const isElectron = /electron/i.test(window.navigator.userAgent)
const log = logger('electron')

// @ts-ignore
export const ipcRenderer = window.electron?.ipcRenderer as {
  send: (chan: string, payload: unknown) => void
  on: (chan: string, cb: (event: Event, msg: string) => void) => void
  removeListener: (
    chan: string,
    cb: (event: Event, msg: string) => void
  ) => void
}

export function sendMessage(chan: string, payload: unknown) {
  if (!isElectron) return
  if (!ipcRenderer) log.error('ipcRenderer undefined')

  log.info('Sending message', chan, payload)

  ipcRenderer.send(chan, JSON.stringify(payload))
}

export function setTray(options: {
  image: string
  title?: string
  tooltip?: string
}) {
  sendMessage('set-tray', {
    image: options.image,
    title: options.title || '',
    tooltip: options.tooltip || '',
  })
}

export function notify(options: { title: string; msg: string }) {
  sendMessage('notify', options)
}
