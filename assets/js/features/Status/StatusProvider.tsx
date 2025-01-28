import React, { useEffect } from 'react'
import selectors from 'selectors'
import { logger } from 'lib/log'
import { useUserSocket } from 'features/UserSocket'
import { useSelector, useDispatch, RootState } from 'state'
import { receiveNewStatus } from './slice'
import { addBatch, Status, Statuses } from 'state/entities'

const log = logger('status/provider')

interface Props {}

export function StatusProvider(props: Props) {
  const dispatch = useDispatch()

  const { channel, fetchEntity } = useUserSocket()

  const [users, missingStatusRecords] = useSelector((state: RootState) => [
    selectors.rooms.getUsersInRoom(
      state,
      selectors.rooms.getFocusedRoomId(state)
    ),
    selectors.status.listMissingStatusRecords(state),
  ])

  useEffect(() => {
    if (!channel) return

    log.info('Listening user status updates')

    channel.on('user:status', (payload: Status) => {
      log.info('Receive new status')
      dispatch(receiveNewStatus(payload))
    })
  }, [!!channel])

  useEffect(() => {
    if (!missingStatusRecords[0]) return
    if (!channel) return

    log.info('Fetch missing status:', missingStatusRecords[0])

    fetchEntity(Statuses, missingStatusRecords[0])
  }, [missingStatusRecords[0]])

  return <></>

  /*function syncOnlineUserStatuses(resp: { statuses: Status[] }) {
    const list = resp.statuses

    log.info('Sync online user statuses', list)

    const userRoomMap: { [id: string]: string[] } = {}
    const userStatusMap: { userId: string; statusId: string }[] = list.map(
      (s) => ({ userId: s.user_id, statusId: s.id })
    )

    for (const status of list) {
      if (userRoomMap[status.room_id]) {
        userRoomMap[status.room_id].push(status.user_id)
      } else {
        userRoomMap[status.room_id] = [status.user_id]
      }
    }

    dispatch(
      addBatch(
        list.map((s) => ({
          id: s.id,
          schema: Statuses,
          data: s,
        }))
      )
    )

    dispatch(setAllRoomUserIds(userRoomMap))
    dispatch(setStatusIdBatch(userStatusMap))
  }*/
}
