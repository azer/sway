import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Entity = User | Org | Room | Status | Participant
export type Table =
  | typeof Users
  | typeof Orgs
  | typeof Rooms
  | typeof Statuses
  | typeof Participants

export interface Update {
  table: Table
  id: string
  record: Entity
}

export const Users = 'users'
export interface User {
  id: string
  orgId: string
  email: string
  name: string
  photoUrl?: string
}

export const Orgs = 'orgs'
export interface Org {
  id: string
  name: string
  domain: string
  logoUrl: string
}

export const Rooms = 'rooms'
export interface Room {
  id: string
  orgId: string
  userId: string
  name: string
  slug: string
  isDefault: boolean
  isActive: boolean
}

export enum PresenceMode {
  Social = 'social',
  Focus = 'focus',
  Solo = 'solo',
  Zen = 'zen',
}

export const Statuses = 'statuses'
export interface Status {
  id: string
  user_id: string
  room_id: string
  status: PresenceMode
  is_active: boolean
  message: string
  inserted_at: Date
}

export const Presences = 'presences'
export interface Presence {
  id: string
  user_id: string
  is_online: boolean
  last_seen_at: string
}

export const Participants = 'daily_participants'
export interface Participant {
  id: string
  sessionId: string
  audio: boolean
  video: boolean
  screen: boolean
}

const initialState = {
  [Users]: {} as Record<string, User>,
  [Orgs]: {} as Record<string, Org>,
  [Rooms]: {} as Record<string, Room>,
  [Statuses]: {} as Record<string, Status>,
  [Participants]: {} as Record<string, Participant>,
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
          // @ts-ignore
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

export function toStateEntity(table: Table, record: any): Entity {
  if (table === Users) {
    return {
      id: record.id,
      orgId: record.org_id,
      email: record.email,
      name: record.name,
      photoUrl: record.profile_photo_url,
    }
  }

  if (table === Participants) {
    return {
      id: record.user_id as string,
      sessionId: record.session_id as string,
      audio: record.audio as boolean,
      video: record.video as boolean,
      screen: record.screen as boolean,
    }
  }

  if (table === Statuses) {
    return {
      ...record,
      id: String(record.id),
      room_id: String(record.room_id),
      user_id: String(record.user_id),
    }
  }

  if (table === Rooms) {
    return {
      ...record,
      id: String(record.id),
      userId: String(record.user_id),
      isActive: record.is_active,
      isDefault: record.is_default,
    }
  }

  return record
}
