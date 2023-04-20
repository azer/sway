import { logger } from './log'

const log = logger('system-notifications')

export function isGranted() {
  return Notification.permission === 'granted'
}

export function isSupported() {
  return window.Notification !== undefined
}

export function requestPermission() {
  if (isGranted()) return
  if (!isSupported()) return

  Notification.requestPermission()
    .then((permission) => {
      if (permission === 'granted') {
        log.info('Notification permission granted.')
      } else {
        log.error('Notification permission denied.')
      }
    })
    .catch((error) => {
      log.error('Error requesting notification permission:', error)
    })
}

interface Options {
  title: string
  body: string
  icon?: string
  badge?: string
  requireInteraction?: boolean
  onClick?: (n: Notification, e: Event) => void
}

export function show(options: Options) {
  if (!isGranted()) return log.error('Can not show notification', options)
  if (!isSupported())
    return log.error('Browser does not support notifications', options)

  log.info('Show notification', options)

  const notification = new Notification(options.title, options)

  // @ts-ignore
  notification.onclick = (n: Notification, e: Event) => {
    log.info('User clicked notification', options)
    if (options.onClick) options.onClick(n, e)
  }

  notification.onerror = (error) => {
    log.error('An error occurred', error, options)
  }

  notification.onshow = () => {
    log.info('Notification was shown')
  }

  return notification
}

export const notifications = {
  isGranted,
  requestPermission,
  show,
}
