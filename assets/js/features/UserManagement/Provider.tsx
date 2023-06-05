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

interface Props {}

const log = logger('user-management/provider')

export function UserManagementProvider(props: Props) {
  const dispatch = useDispatch()
  const commandRegistry = useCommandRegistry()

  const [workspaceId, users] = useSelector((state) => [
    selectors.workspaces.getFocusedWorkspaceId(state),
    selectors.userManagement
      .listUsersInFocusedWorkspace(state)
      .map((id) => selectors.users.getById(state, id)),
  ])

  useEffect(() => {
    GET('/api/users?workspace_id=' + workspaceId)
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
        register('Wave at', stop, {
          icon: 'wave',
          keywords: ['wave'],
          type: CommandType.Interaction,
        })
      }
    },
    [users.length]
  )

  return <></>
}
