import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { removeStatusHook } from 'features/Tap/slice'
import { useUserSocket } from 'features/UserSocket'
import { logger } from 'lib/log'
import { notifications } from 'lib/notifications'
import selectors from 'selectors'
import { AppDispatch, entities, RootState } from 'state'
import { add, Entity, Status, Statuses, toStateEntity } from 'state/entities'

export const name = 'presence'
const log = logger('presence/slice')

interface State {
  userStatuses: { [userId: string]: string }
  statusUpdates: { [userId: string]: string[] }
}

export const initialState: State = {
  // @ts-ignore
  userStatuses: window.initialState?.userStatusMap || {},
  statusUpdates: {},
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
    addStatusUpdates: (
      state,
      action: PayloadAction<{ userId: string; updates: string[] }>
    ) => {
      state.statusUpdates[action.payload.userId] = action.payload.updates
    },
  },
})

export const { setStatusId, setStatusIdBatch, addStatusUpdates } = slice.actions
export default slice.reducer

export function tap(fromUserId: string) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const user = selectors.users.getById(getState(), fromUserId)
    const ctx = useUserSocket()

    log.info('tap user', user)

    ctx.channel
      ?.push('entities:fetch', { id: fromUserId, entity: entities.Users })
      .receive('ok', (record: entities.User) => {
        log.info('taped user rec', record)
      })
  }
}

export function receive(status: Status) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    log.info('Received new user status', status)

    dispatch(
      add({
        table: Statuses,
        id: status.id,
        record: toStateEntity(Statuses, status),
      })
    )

    dispatch(setStatusId({ userId: status.user_id, statusId: status.id }))

    const state = getState()
    const triggered = selectors.taps.getTriggeredStatusHooks(state)
    log.info('Triggered hooks', triggered)

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
        icon: user?.photoUrl,
        badge: user?.photoUrl,
        requireInteraction: true,
      })
    }
  }
}
