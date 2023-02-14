import { useUserSocket } from 'features/UserSocket'
import selectors from 'selectors'
import { PresenceMode } from 'state/entities'
import { useSelector } from 'state'
import { logger } from 'lib/log'

const log = logger('presence/use-presence')

export function usePresence() {
  const { channel } = useUserSocket()

  const [localPresence, workspaceId, roomId] = useSelector((state) => [
    selectors.presence.getSelfStatus(state),
    selectors.workspaces.getSelfWorkspace(state)?.id,
    selectors.rooms.getFocusedRoom(state)?.id,
  ])

  return {
    modes: [
      PresenceMode.Focus,
      PresenceMode.Social,
      PresenceMode.Zen,
      PresenceMode.Solo,
    ],
    setMode,
    setActive,
    setMedia,
  }

  function setMedia(options: {
    mode?: PresenceMode
    camera?: boolean
    mic?: boolean
    speaker?: boolean
  }) {
    const settings = {
      mode: options.mode || localPresence.status,
      camera_on: or<boolean>(options.camera, localPresence.camera_on),
      mic_on: or<boolean>(options.mic, localPresence.mic_on),
      speaker_on: or<boolean>(options.speaker, localPresence.speaker_on),
    }

    if (
      settings.mode !== PresenceMode.Social &&
      settings.camera_on &&
      !settings.mic_on
    ) {
      // User turns on camera manually
      settings.mode = PresenceMode.Social
    } else if (
      localPresence.status === PresenceMode.Social &&
      !settings.camera_on
    ) {
      // User turns off the video on social mode
      settings.mode = PresenceMode.Focus
    } else if (options.mode === PresenceMode.Social) {
      // User switches to social mode when camera is off
      settings.camera_on = true
      settings.mic_on = false
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

  function setMode(newMode: PresenceMode) {
    log.info('Setting presence mode as', newMode)

    setMedia({
      mode: newMode,
      speaker: newMode !== PresenceMode.Zen,
      mic: false,
      camera: newMode === PresenceMode.Social,
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
