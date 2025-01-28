import { logger } from 'lib/log'

const CACHE_NAME = 'sway_web'
const CACHE_VERSION = 'v0.0.19'
const CACHE_STORE_KEY = CACHE_NAME + '-' + CACHE_VERSION

let isCachingDisabled = false
const preCachedUrls = ['/']
const nonCachedUrls = [
  '/assets/serviceworker.js',
  '/login',
  '/auth',
  '/desktop',
  '/join',
  '/users',
  '/phoenix',
]
const validOrigins = ['https://sway.so', 'http://localhost:4000']

const log = logger('service-worker-' + CACHE_VERSION)

// Listening to messages from the main thread
self.addEventListener('message', (event) => {
  log.info('Message received:', event)

  if (event.data === 'init') {
    messagePort = event.ports[0]
  }
  if (event.data === 'enable-offline-caching') {
    isCachingDisabled = false
  }
  if (event.data === 'disable-offline-caching') {
    isCachingDisabled = true
  }
})

self.addEventListener('install', (event) => {
  log.info('Skip waiting')
  self.skipWaiting()
})

// Activate event to handle cache management
self.addEventListener('activate', (event) => {
  const cacheName = CACHE_STORE_KEY
  const validCaches = [cacheName]

  log.info('Activate')

  event.waitUntil(
    self.caches.keys().then(async (cacheNames) => {
      const oldCaches = cacheNames.filter(
        (cacheName) => !validCaches.includes(cacheName)
      )
      if (oldCaches.length > 0) {
        log.info('Deleting old caches', oldCaches)
        await Promise.all(
          oldCaches.map((cacheName) => self.caches.delete(cacheName))
        )
      }

      await caches.open(cacheName)

      const abortController = new AbortController()
      let abortTimeout = setTimeout(() => {
        abortController.abort()
      }, 2000)

      // Prefetch and cache URLs
      await Promise.allSettled(
        preCachedUrls.map((url) => {
          log.info('Prefetching', url)
          return fetch(url, { signal: abortController.signal })
        })
      ).then(() => {
        if (abortTimeout) {
          clearTimeout(abortTimeout)
        }
      })
    })
  )
})

// Handle fetch requests
self.addEventListener('fetch', (event) => {
  log.info('Fetch', event.request.method, event.request.url)

  if (isCachingDisabled) {
    return
  }

  const request = event.request
  const url = new URL(request.url)

  // Ensure the request is a GET, uses HTTP protocol, is from valid origin and is not on the non-cached list
  if (
    request.method !== 'GET' ||
    !['http:', 'https:'].includes(url.protocol) ||
    !validOrigins.some((origin) => request.url.startsWith(origin)) ||
    nonCachedUrls.some((path) => url.pathname.startsWith(path))
  ) {
    return
  }

  log.info('Respond to ', request.url)

  // Respond with cached response if available, otherwise fetch from network
  event.respondWith(
    fetch(request)
      .then(async (response) => {
        // Don't cache or alter non-200 status responses
        if (response.status !== 200) {
          return response
        }

        // Clone response for caching
        const clonedResponse = response.clone()
        const cache = await caches.open(CACHE_STORE_KEY)
        cache.put(request, clonedResponse)
        log.info('Cached response', request.url)
        return response
      })
      .catch(async (error) => {
        const cache = await caches.open(CACHE_STORE_KEY)
        const cachedResponse = await cache.match(request)

        if (cachedResponse) {
          log.info('Serving from cache', request.url)
          return cachedResponse
        }
        throw error
      })
  )
})

// Handle incoming push notifications
/*self.addEventListener('push', (event) => {
  try {
    const data = event.data.text()
    const parsedData = JSON.parse(data)

    if (parsedData.type === 'notification') {
      const options = {
        body: parsedData.body,
        requireInteraction: parsedData.requireInteraction,
        data: {
          link: parsedData.link,
        },
      }

      // Display notification
      event.waitUntil(
        self.registration.showNotification(
          parsedData.title || 'Linear',
          options
        )
      )
    }
  } catch (error) {
    messagePort &&
      messagePort.postMessage({
        type: 'error',
        message: 'Failed to handle web push notification',
        error: error,
      })
      }
})*/
