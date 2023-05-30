import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal'
import { AppDispatch, RootState } from 'state'
import { logger } from 'lib/log'
import { add, Status, Statuses } from 'state/entities'
import { removeStatusHook } from 'features/Tap/slice'
import { notifications } from 'lib/notifications'
import selectors from 'selectors'
import { PhoenixPresenceState } from 'features/Presence/slice'

const log = logger('status/slice')

export const name = 'statuses'

interface State {
  latestStatusByUserId: { [userId: string]: { [workspaceId: string]: string } }
  statusUpdatesByRoomId: { [roomId: string]: string[] }
  statusUpdatesByUserId: {
    [userId: string]: { [workspaceId: string]: string[] }
  }
}

export const initialState: State = {
  latestStatusByUserId: {},
  statusUpdatesByUserId: {},
  statusUpdatesByRoomId: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setLatestStatusByUserId: (
      state,
      action: PayloadAction<{
        userId: string
        workspaceId: string
        statusId: string
      }>
    ) => {
      state.latestStatusByUserId[action.payload.userId] = {
        ...state.latestStatusByUserId[action.payload.userId],
        [action.payload.workspaceId]: action.payload.statusId,
      }
    },
    setStatusUpdatesByRoomId: (
      state,
      action: PayloadAction<{ roomId: string; statusIds: string[] }>
    ) => {
      state.statusUpdatesByRoomId[action.payload.roomId] =
        action.payload.statusIds
    },
    setStatusUpdatesByUserId: (
      state,
      action: PayloadAction<{
        userId: string
        workspaceId: string
        statusIds: string[]
      }>
    ) => {
      state.statusUpdatesByUserId[action.payload.userId] = {
        ...state.statusUpdatesByUserId[action.payload.userId],
        [action.payload.workspaceId]: action.payload.statusIds,
      }
    },
    addStatusUpdateByUserId: (
      state,
      action: PayloadAction<{
        userId: string
        statusId: string
        workspaceId: string
      }>
    ) => {
      setNewStatusForUser(
        state,
        action.payload.userId,
        action.payload.workspaceId,
        action.payload.statusId
      )
    },
    syncOnlineUserStatuses: (
      state,
      action: PayloadAction<PhoenixPresenceState>
    ) => {
      for (const key in action.payload) {
        const meta = action.payload[key].metas[0]
        if (!meta) continue

        setNewStatusForUser(
          state,
          meta.user_id,
          meta.workspace_id,
          meta.status_id
        )
      }
    },
  },
})

export const {
  setLatestStatusByUserId,
  setStatusUpdatesByRoomId,
  setStatusUpdatesByUserId,
  addStatusUpdateByUserId,
  syncOnlineUserStatuses,
} = slice.actions
export default slice.reducer

export function receiveNewStatus(status: Status) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    log.info('Received new user status', status)

    dispatch(
      add({
        schema: Statuses,
        id: status.id,
        data: status,
      })
    )

    dispatch(
      addStatusUpdateByUserId({
        userId: status.user_id,
        statusId: status.id,
        workspaceId: status.workspace_id,
      })
    )

    //dispatch(addStatusUpdates({ userId: status.user_id, updates: [status.id] }))

    // FIXME:
    const state = getState()
    const triggered = selectors.taps.getTriggeredStatusHooks(state)

    if (triggered.length > 0) {
      dispatch(removeStatusHook(triggered.map((h) => h.userId)))

      const last = triggered[triggered.length - 1]
      const user = selectors.users.getById(state, last.userId)
      const status = selectors.status.getStatusByUserId(state, last.userId)
      const isActive = status.camera_on || status.mic_on
      const room = selectors.rooms.getRoomById(state, status.room_id)
      const label = isActive ? 'active' : 'online'

      notifications.show({
        title: `${user?.name} is available`,
        body: `${user?.name} is ${label} in the ${room.name} room`,
        icon: user?.profile_photo_url || undefined,
        badge: user?.profile_photo_url || undefined,
        requireInteraction: true,
      })
    }
  }
}

function setNewStatusForUser(
  state: WritableDraft<State>,
  userId: string,
  workspaceId: string,
  statusId: string
) {
  if (!statusId) {
    log.error('No status specified:', userId, workspaceId, statusId)
    return
  }

  log.info('Setting new status for user:', userId, workspaceId, statusId)

  // set the latest status id for the user
  state.latestStatusByUserId[userId] = {
    ...state.latestStatusByUserId[userId],
    [workspaceId]: statusId,
  }

  if (!state.statusUpdatesByUserId[userId]) {
    state.statusUpdatesByUserId[userId] = {}
  }

  // add the update to the list of updates by suer
  const existing = state.statusUpdatesByUserId[userId][workspaceId]

  if (!existing) {
    // first ever status, create a new list for the workspace
    state.statusUpdatesByUserId[userId][workspaceId] = [statusId]
  } else if (!existing.includes(statusId)) {
    // already some updates, attach it to the beginning
    state.statusUpdatesByUserId[userId][workspaceId] = [statusId].concat(
      state.statusUpdatesByUserId[userId][workspaceId]
    )
  }
}
