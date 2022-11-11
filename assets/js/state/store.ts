import { configureStore } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import allReducers from './reducers'

const logger = createLogger({
  duration: true,
  collapsed: true,
})

export const store = configureStore({
  reducer: allReducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
