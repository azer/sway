import React, { useEffect } from 'react'
import selectors from 'selectors'
import { logger } from 'lib/log'
import { useUserSocket } from 'features/UserSocket'
import { useSelector, useDispatch, RootState } from 'state'
import { receiveNewStatus } from './slice'
import { Status, Statuses } from 'state/entities'

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

    channel.on('user:status', (payload: Status) =>
      dispatch(receiveNewStatus(payload))
    )
  }, [!!channel])

  useEffect(() => {
    if (!missingStatusRecords[0]) return
    if (!channel) return

    log.info('Fetch missing status:', missingStatusRecords[0])

    fetchEntity(Statuses, missingStatusRecords[0])
  }, [missingStatusRecords[0]])

  return <></>
}
