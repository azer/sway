import { logger } from 'lib/log'

const log = logger('register-service-worker')

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/assets/serviceworker.js', { scope: '/' })
        .then(done, error)
    })
  }

  function error(err: Error) {
    log.error('ServiceWorker registration failed: ', err)
  }

  function done(registration: ServiceWorkerRegistration) {
    log.info(
      'ServiceWorker registration successful with scope: ',
      registration.scope
    )
  }
}
