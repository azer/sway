import { logger } from './log'

export const isElectron = /electron/i.test(window.navigator.userAgent)
const log = logger('electron')

// @ts-ignore
const ipcRenderer = window.electron?.ipcRenderer as {
  send: (chan: string, payload: unknown) => void
}

export function sendMessage(chan: string, payload: unknown) {
  log.info('Sending message', chan, payload)

  if (!isElectron) return
  if (!ipcRenderer) log.error('ipcRenderer undefined')

  ipcRenderer.send(chan, JSON.stringify(payload))
}

export function setTray(options: {
  image: string
  title?: string
  tooltip?: string
}) {
  sendMessage('tray', {
    image: options.image,
    title: options.title || '',
    tooltip: options.tooltip || '',
  })
}

export function notify(options: { title: string; msg: string }) {
  sendMessage('notify', options)
}
