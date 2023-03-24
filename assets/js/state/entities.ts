import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PresenceStatus } from './presence'

export type Entity = User | Workspace | Room | Status | Participant | Membership

export type Table =
  | typeof Users
  | typeof Workspaces
  | typeof Rooms
  | typeof Statuses
  | typeof Participants
  | typeof Memberships

export interface Update {
  table: Table
  id: string
  record: Entity
}

export const Users = 'users'
export interface User {
  id: string
  email: string
  name: string
  photoUrl?: string
}

export const Memberships = 'memberships'
export interface Membership {
  id: string
  user_id: string
  workspace_id: string
  is_admin: boolean
  inserted_at: string
}

export const Workspaces = 'workspaces'
export interface Workspace {
  id: string
  name: string
  domain: string
  logoUrl: string
  slug: string
}

export const Rooms = 'rooms'
export interface Room {
  id: string
  workspace_id: string
  user_id: string
  name: string
  slug: string
  is_default: boolean
  is_active: boolean
}

export const Statuses = 'statuses'
export interface Status {
  id: string
  user_id: string
  room_id: string
  workspace_id: string
  status: PresenceStatus
  camera_on: boolean
  speaker_on: boolean
  mic_on: boolean
  message: string
  timezone: string
  emoji: string
  inserted_at: Date
}

/*export const Presences = 'presences'
export interface Presence {
  id: string
  user_id: string
  is_online: boolean
  last_seen_at: string
}*/

export const Participants = 'daily_participants'
export interface Participant {
  id: string
  sessionId: string
  audio: boolean
  video: boolean
  screen: boolean
}

export const initialState = {
  [Users]: initial<User>(Users),
  [Memberships]: initial<Membership>(Memberships),
  [Workspaces]: initial<Workspace>(Workspaces),
  [Rooms]: initial<Room>(Rooms),
  [Statuses]: initial<Status>(Statuses),
  [Participants]: initial<Participant>(Participants),
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
      id: String(record.id),
      email: record.email,
      name: record.name,
      photoUrl: record.profile_photo_url,
    }
  }

  if (table === Participants) {
    return {
      id: String(record.user_id) as string,
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
      workspace_id: String(record.workspace_id),
      inserted_at: new Date(record.inserted_at),
    }
  }

  if (table === Rooms) {
    return {
      ...record,
      id: String(record.id),
      user_id: String(record.user_id),
      workspace_id: String(record.workspace_id),
      is_active: record.is_active,
      is_default: record.is_default,
    }
  }

  if (table === Memberships) {
    return {
      ...record,
      id: String(record.id),
      user_id: String(record.user_id),
      workspace_id: String(record.workspace_id),
      is_admin: record.is_admin,
    }
  }

  if (table === Workspaces) {
    return {
      ...record,
      id: String(record.id),
      name: record.name,
      slug: record.slug,
      domain: record.slug,
    }
  }

  return record
}

function initial<T>(table: Table): Record<string, T> {
  const result: Record<string, T> = {}

  // @ts-ignore
  if (window.initialState && window.initialState.entities[table]) {
    // @ts-ignore
    for (const r of window.initialState.entities[table]) {
      // @ts-ignore
      result[r.id] = toStateEntity(table, r)
    }
  }

  return result
}
