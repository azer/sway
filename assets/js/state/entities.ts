import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Entity = User | Org | Room | Status
export type Table = typeof Users | typeof Orgs | typeof Rooms | typeof Statuses

export interface Update {
  table: Table
  id: string
  record: Entity
}

export const Users = 'users'
export interface User {
  id: string
  orgId: string
  name: string
  photoUrl?: string
}

export const Orgs = 'orgs'
export interface Org {
  id: string
  name: string
  domain: string
  logo_url: string
}

export const Rooms = 'rooms'
export interface Room {
  id: string
  org_id: string
  user_id: string
  name: string
}

export const Statuses = 'statuses'
export interface Status {
  id: string
  org_id: string
  user_id: string
  status: string
  message: string
  started_at: string
  ended_at: string
}

export const Presences = 'presences'
export interface Presence {
  id: string
  user_id: string
  is_online: boolean
  last_seen_at: string
}

const initialState = {
  [Users]: {} as Record<string, User>,
  [Orgs]: {} as Record<string, Org>,
  [Rooms]: {} as Record<string, Room>,
  [Statuses]: {} as Record<string, Status>,
}

export const slice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Update>) => {
      state[action.payload.table][action.payload.id] = action.payload.record
    },
    addBatch: (state, action: PayloadAction<Update[]>) => {
      for (let update of action.payload) {
        if (!state[update.table]) {
          state[update.table] = {}
        }

        state[update.table][update.id] = update.record
      }
    },
    addInitialState: (state, action: PayloadAction<undefined>) => {
      const entities = (window as any).initialState?.entities

      if (!entities) return

      for (const table in entities) {
        for (const row of entities[table]) {
          state[table][row.id] = row
        }
      }
    },
    removeBatch: (
      state,
      action: PayloadAction<{ table: Table; id: string }[]>
    ) => {
      for (let row of action.payload) {
        delete state[row.table][row.id]
      }
    },
  },
})

export const { add, addBatch, addInitialState, removeBatch } = slice.actions

export default slice.reducer
