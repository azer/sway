import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { removeStatusHook } from 'features/Tap/slice'
import { logger } from 'lib/log'
import { notifications } from 'lib/notifications'
import selectors from 'selectors'
import { AppDispatch, RootState } from 'state'
import { add, Status, Statuses } from 'state/entities'

export const name = 'presence'
const log = logger('presence/slice')

interface State {
  userStatuses: { [userId: string]: string }
  statusUpdates: { [userId: string]: string[] }
  roomStatuses: { [roomId: string]: string[] }
  //  usersByRooms: { [userId: string]: string[] }
}

export const initialState: State = {
  // @ts-ignore
  userStatuses: window.initialState?.userStatusMap || {},
  statusUpdates: {},
  roomStatuses: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setStatusId: (
      state,
      action: PayloadAction<{ userId: string; statusId: string }>
    ) => {
      state.userStatuses[action.payload.userId] = action.payload.statusId
    },
    setStatusIdBatch: (
      state,
      action: PayloadAction<{ userId: string; statusId: string }[]>
    ) => {
      for (const row of action.payload) {
        state.userStatuses[row.userId] = row.statusId
      }
    },
    setStatusUpdates: (
      state,
      action: PayloadAction<{ userId: string; updates: string[] }>
    ) => {
      state.statusUpdates[action.payload.userId] = action.payload.updates
      if (action.payload.updates[0]) {
        state.userStatuses[action.payload.userId] = action.payload.updates[0]
      }
    },
    addStatusUpdates: (
      state,
      action: PayloadAction<{ userId: string; updates: string[] }>
    ) => {
      const existing = state.statusUpdates[action.payload.userId]
      const next = existing
        ? action.payload.updates.concat(existing)
        : action.payload.updates

      state.statusUpdates[action.payload.userId] = Array.from(new Set(next))
    },
    setRoomStatusUpdates: (
      state,
      action: PayloadAction<{ roomId: string; updates: string[] }>
    ) => {
      state.roomStatuses[action.payload.roomId] = action.payload.updates
    },
  },
})

export const {
  setStatusId,
  setStatusIdBatch,
  setStatusUpdates,
  addStatusUpdates,
  setRoomStatusUpdates,
} = slice.actions
export default slice.reducer

export function receive(status: Status) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    log.info('Received new user status', status)

    dispatch(
      add({
        schema: Statuses,
        id: status.id,
        data: status,
      })
    )

    dispatch(setStatusId({ userId: status.user_id, statusId: status.id }))
    dispatch(addStatusUpdates({ userId: status.user_id, updates: [status.id] }))

    const state = getState()
    const triggered = selectors.taps.getTriggeredStatusHooks(state)

    if (triggered.length > 0) {
      dispatch(removeStatusHook(triggered.map((h) => h.userId)))

      const last = triggered[triggered.length - 1]
      const user = selectors.users.getById(state, last.userId)
      const status = selectors.statuses.getByUserId(state, last.userId)
      const isActive = status.camera_on || status.mic_on
      const room = selectors.rooms.getRoomById(state, status.room_id)
      const label = isActive ? 'active' : 'online'

      notifications.show({
        title: `${user?.name} is available`,
        body: `${user?.name} is ${label} in the ${room.name} room`,
        icon: user?.profile_photo_url,
        badge: user?.profile_photo_url,
        requireInteraction: true,
      })
    }
  }
}
