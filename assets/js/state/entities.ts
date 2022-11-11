import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Entity = User
export type Table = typeof Users

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

const initialState = {
  [Users]: {} as Record<string, User>,
}

export const slice = createSlice({
  name: 'entities',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<Update>) => {
      state[action.payload.table][action.payload.id] = action.payload.record
    },
    setBatch: (state, action: PayloadAction<Update[]>) => {
      for (let update of action.payload) {
        if (!state[update.table]) {
          state[update.table] = {}
        }

        state[update.table][update.id] = update.record
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

export const { set, setBatch, removeBatch } = slice.actions

export default slice.reducer
