/*import { useUserSocket } from 'features/UserSocket'
import selectors from 'selectors'
import { StatusModeKey } from 'state/status'
import { useSelector } from 'state'
import { logger } from 'lib/log'
import { useEffect, useState } from 'react'

const log = logger('presence/use-presence')

interface StatusChange {
  mode?: StatusModeKey
  camera?: boolean
  mic?: boolean
  speaker?: boolean
}

export function useStatus() {
  const { channel } = useUserSocket()
  const [statusChange, setStatusChange] = useState<StatusChange>()

  const [localStatus, workspaceId, roomId, localUserId] = useSelector(
    (state) => [
      selectors.status.getLocalStatus(state),
      selectors.workspaces.getSelfWorkspace(state)?.id,
      selectors.rooms.getFocusedRoom(state)?.id,
      selectors.session.getUserId(state),
    ]
  )

  useEffect(() => {
    if (!statusChange || !channel) return

    log.info('Pushing status change to backend.', statusChange)

    const change = statusChange
    setStatusChange(undefined)

    const settings = {
      mode: change.mode || localStatus.status,
      camera_on: or<boolean>(change.camera, localStatus.camera_on),
      mic_on: or<boolean>(change.mic, localStatus.mic_on),
      speaker_on: or<boolean>(change.speaker, localStatus.speaker_on),
    }

    channel.push('user:status', {
      workspace_id: workspaceId,
      room_id: roomId,
      ...settings,
    })
  }, [channel, statusChange])

  return {
    join,
    leave,
    setMode,
    setActive,
    setMedia,
    setEmoji,
    setMessage,
    tap,
    channel,
    localStatus,
  }



  function setMedia(change: {
    mode?: StatusModeKey
    camera?: boolean
    mic?: boolean
    speaker?: boolean
  }) {
    setStatusChange(change)
  }

  function setMode(newMode: StatusModeKey) {
    log.info('Setting presence mode as', newMode)

    setMedia({
      mode: newMode,
      speaker: newMode !== StatusModeKey.Zen,
      mic: false,
      camera: false,
    })
  }

  function setEmoji(emoji: string | undefined) {
    log.info('Setting status emoji as', emoji)

    channel?.push('user:status', {
      workspace_id: workspaceId,
      emoji: emoji,
    })
  }

  function setMessage(message: string) {
    log.info('Setting status message as', message)

    channel?.push('user:status', {
      workspace_id: workspaceId,
      message,
    })
  }

  function setActive(active: boolean) {
    log.info('Setting as active / inactive', active)
    setMedia({ camera: active, mic: active, speaker: true })
  }

  function tap(targetUserId: string) {
    log.info('Push tap message', targetUserId)

    channel?.push('users:tap', {
      from: localUserId,
      to: targetUserId,
      workspace_id: workspaceId,
      room_id: roomId,
    })
  }
}

function or<T>(a: T | undefined, b: T | undefined): T {
  return (a !== undefined ? a : b) as T
}
*/
