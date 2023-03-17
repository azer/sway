import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useUserSocket } from 'features/UserSocket'
import { logger } from 'lib/log'
import selectors from 'selectors'
import { AppDispatch, entities, RootState } from 'state'
import { Entity } from 'state/entities'

export const name = 'presence'
const log = logger('presence/slice')

interface State {
  userStatuses: { [userId: string]: string }
}

export const initialState: State = {
  // @ts-ignore
  userStatuses: window.initialState?.status || {},
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
  },
})

export const { setStatusId } = slice.actions
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
