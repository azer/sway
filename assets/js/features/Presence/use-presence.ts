import { useUserSocket } from 'features/UserSocket'
import selectors from 'selectors'
import { PresenceMode } from 'state/entities'
import { useSelector } from 'state'
import { logger } from 'lib/log'

const log = logger('presence/use-presence')

export function usePresence() {
  const { channel } = useUserSocket()

  return {
    modes: [
      PresenceMode.Focus,
      PresenceMode.Social,
      PresenceMode.Zen,
      PresenceMode.Solo,
    ],
    setMode,
    setActive,
  }

  function setMode(newMode: PresenceMode, roomId: string, workspaceId: string) {
    channel?.push('user:status', {
      presence_mode: newMode,
      room_id: roomId,
      workspace_id: workspaceId,
    })
  }

  function setActive(active: boolean, workspaceId: string) {
    log.info('channel', channel)

    channel?.push('user:status', {
      is_active: active,
      workspace_id: workspaceId,
    })
  }
}
