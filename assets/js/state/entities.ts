import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { APIResponse, APIResponseRow } from 'lib/api'
import { PresenceStatus } from './presence'
import { AppDispatch, RootState } from './store'

export type Entity = User | Workspace | Room | Status | Participant | Membership

export type Schema =
  | typeof Users
  | typeof Workspaces
  | typeof Rooms
  | typeof Statuses
  | typeof Participants
  | typeof Memberships

export interface Update {
  schema: Schema
  id: string
  data: Entity
}

export const Users = 'users'
export interface User {
  id: string
  email: string
  name: string
  profile_photo_url: string | null
  inserted_at: string
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
  is_private: boolean
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
  inserted_at: string
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
      state[action.payload.schema][action.payload.id] = action.payload.data
    },
    addBatch: (state, action: PayloadAction<Update[]>) => {
      for (let update of action.payload) {
        if (!state[update.schema]) {
          state[update.schema] = {}
        }

        state[update.schema][update.id] = update.data
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
      action: PayloadAction<{ table: Schema; id: string }[]>
    ) => {
      for (let row of action.payload) {
        delete state[row.table][row.id]
      }
    },
  },
})

export const { add, addBatch, addInitialState, removeBatch } = slice.actions

export default slice.reducer

export function scanAPIResponse(resp: APIResponse) {
  return (dispatch: AppDispatch) => {
    const updates: Update[] = []
    if (resp.result) {
      updates.push(resp.result as Update)
    }

    if (resp.list) {
      updates.push.apply(updates, resp.list as Update[])
    }

    if (resp.links) {
      updates.push.apply(updates, resp.links as Update[])
    }

    dispatch(addBatch(updates))
  }
}

function initial<T>(table: Schema): Record<string, T> {
  const result: Record<string, T> = {}

  // @ts-ignore
  if (window.initialState && window.initialState.entities[table]) {
    // @ts-ignore
    for (const r of window.initialState.entities[table]) {
      // @ts-ignore
      result[r.id] = r
    }
  }

  return result
}
