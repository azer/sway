import indexeddbStorage from '@piotr-cz/redux-persist-idb-storage'
import { createSerializableStateInvariantMiddleware } from '@reduxjs/toolkit'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'reduxjs-toolkit-persist'
import autoMergeLevel2 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel2'
import defaultStorage from 'reduxjs-toolkit-persist/lib/storage'
import { logger } from 'lib/log'

const log = logger('state/persistency')

const DB_NAME = 'sway-mvp'
const STORE_NAME = 'offline-data'

export const persistencyConfig = {
  key: 'root',
  storage: globalThis.indexedDB
    ? indexeddbStorage({
        name: DB_NAME,
        storeName: STORE_NAME,
      })
    : defaultStorage,
  stateReconciler: autoMergeLevel2,
  serialize: false,
  deserialize: false,
  whitelist: ['onboarding', 'settings'],
}

// const reducer = persistCombineReducers(config, reducers)
export const ignoredActions = createSerializableStateInvariantMiddleware({
  ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
})

export function deleteIDBDatabase(): Promise<void> {
  log.info('Deleting IDB')

  return new Promise((resolve, reject) => {
    if (!DB_NAME) return

    var DBDeleteRequest = window.indexedDB.deleteDatabase(DB_NAME)

    DBDeleteRequest.onerror = function () {
      reject(new Error('Error deleting database'))
    }

    DBDeleteRequest.onsuccess = function (event) {
      resolve()
    }
  })
}
