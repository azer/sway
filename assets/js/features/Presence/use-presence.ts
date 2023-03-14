import { useUserSocket } from 'features/UserSocket'
import selectors from 'selectors'
import { PresenceStatus } from 'state/presence'
import { useSelector } from 'state'
import { logger } from 'lib/log'

const log = logger('presence/use-presence')

export function usePresence() {
  const { channel } = useUserSocket()

  const [localStatus, workspaceId, roomId] = useSelector((state) => [
    selectors.statuses.getLocalStatus(state),
    selectors.workspaces.getSelfWorkspace(state)?.id,
    selectors.rooms.getFocusedRoom(state)?.id,
  ])

  return {
    setMode,
    setActive,
    setMedia,
    setEmoji,
    setMessage,
  }

  function setMedia(options: {
    mode?: PresenceStatus
    camera?: boolean
    mic?: boolean
    speaker?: boolean
  }) {
    const settings = {
      mode: options.mode || localStatus.status,
      camera_on: or<boolean>(options.camera, localStatus.camera_on),
      mic_on: or<boolean>(options.mic, localStatus.mic_on),
      speaker_on: or<boolean>(options.speaker, localStatus.speaker_on),
    }

    // User turns on mic & forgetting speaker off
    if (settings.mic_on && !settings.speaker_on) {
      settings.speaker_on = true
    }

    log.info('Updating local media settings', options, settings)

    channel?.push('user:status', {
      workspace_id: workspaceId,
      room_id: roomId,
      ...settings,
    })
  }

  function setMode(newMode: PresenceStatus) {
    log.info('Setting presence mode as', newMode)

    setMedia({
      mode: newMode,
      speaker: newMode !== PresenceStatus.Zen,
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
}

function or<T>(a: T | undefined, b: T | undefined): T {
  return (a !== undefined ? a : b) as T
}
