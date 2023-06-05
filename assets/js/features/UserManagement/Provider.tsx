import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { GET } from 'lib/api'
import { addBatch, Update } from 'state/entities'
import { setUsersByWorkspaceId } from './slice'
import { CommandType } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useRooms } from 'features/Room/use-rooms'
import { useStatus } from 'features/Status/use-status'

interface Props {}

const log = logger('user-management/provider')

export function UserManagementProvider(props: Props) {
  const dispatch = useDispatch()
  const presence = useStatus()
  const { useRegister } = useCommandRegistry()
  //const rooms = useRooms()

  const [localUser, workspaceId, users] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.workspaces.getFocusedWorkspaceId(state),
    selectors.userManagement
      .listUsersInFocusedWorkspace(state)
      .map((id) => selectors.users.getById(state, id)),
  ])

  log.info('user management')

  useEffect(() => {
    GET('/api/users?workspace_id[eq]=' + workspaceId)
      .then((resp) => {
        if (!resp.list) return log.error('Unexpected response', resp)

        dispatch(addBatch(resp.list.concat(resp.links) as Update[]))
        dispatch(
          setUsersByWorkspaceId({
            workspaceId,
            userIds: resp.list.map((r) => r.id),
          })
        )
      })
      .catch((err) => {
        log.error('Can not fetch workspace users', err)
      })
  }, [])

  useRegister(
    (register) => {
      log.info('Register user maangement commands', users.length)

      for (const user of users) {
        if (!user || user.id === localUser?.id) continue

        register('Wave to ' + user.name, stop, {
          id: 'wave-' + user.id,
          emoji: 'wave',
          keywords: ['wave', 'tap'],
          type: CommandType.Interaction,
          callback: (_: string) => wave(user.id),
        })

        /*register('Message ' + user.name, stop, {
          id: 'Message-' + user.id,
          icon: 'mail',
          keywords: ['mail', 'message'],
          type: CommandType.Interaction,
          callback: () => message(user.id),
        })*/
      }
    },
    [users.length, localUser?.id]
  )

  return <></>

  function message(userId: string) {
    //rooms.createOrEnterPrivateRoom(userId, privateRoomId, privateRoomSlug)
  }

  function wave(userId: string) {
    presence.tap(userId)
  }
}
