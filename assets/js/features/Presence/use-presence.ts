/*import { useUserSocket } from 'features/UserSocket'
psimport selectors from 'selectors'
import { PresenceMode } from 'state/entities'
import { useSelector } from 'state'
import { logger } from 'lib/log'

const log = logger('presence/use-presence')

export function usePresence() {
  const { channel } = useUserSocket()

  const [roomId, status] = useSelector((state) => [
    selectors.rooms.getFocusedRoomId(state),
    selectors.presence.getSelfStatus(state),
  ])

  return {
    status,
    mode: status.status,
    setMode,
    setActive,
  }

  function setMode(newMode: PresenceMode) {
    channel?.push('user:status', {
      presence_mode: newMode,
      room_id: roomId,
      workspace_id: workspaceId
    })
  }

  function setActive(active: boolean) {
    log.info('channel', channel)

    channel?.push('user:status', {
      is_active: active,
      workspace_id: workspaceId
    })
  }
}
*/
