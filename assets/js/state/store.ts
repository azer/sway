import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import { ignoredActions, persistencyConfig } from './persistency'
import allReducers from './reducers'

import { persistCombineReducers, persistStore } from 'reduxjs-toolkit-persist'

const logger = createLogger({
  duration: true,
  collapsed: true,
})

export const basicStore = configureStore({
  reducer: allReducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
})

export const persistentStore = configureStore({
  reducer: persistCombineReducers(persistencyConfig, allReducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ignoredActions).concat(logger),
})

export const persistor = persistStore(persistentStore)

export const store = persistentStore

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
