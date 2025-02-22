import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { performSearch, useCommandRegistry } from 'features/CommandRegistry'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import { logger } from 'lib/log'
import { CallSettingsPreview } from './CallSettingsPreview'
import { syncDevices } from './slice'
import { useSelector, useDispatch } from 'state'
import { useVideoSettings } from './VideoSettings'
import { useMicSettings } from './MicSettings'
import { useSpeakerSettings } from './SpeakerSettings'
import debounce from 'debounce-fn'
import { usePushToTalkSettings } from './PushToTalkSettings'
import { useBackgroundBlurSettings } from './BackgroundBlur'
import { useStatusSettings } from './PresenceSettings'
import { useInvitePeople } from './InvitePeople'
import { useHotkeys } from 'react-hotkeys-hook'
import { deleteIDBDatabase } from 'state/persistency'

interface Props {}

const log = logger('settings')

export function useSettings() {
  const dispatch = useDispatch()
  const commandPalette = useCommandPalette()
  const videoSettings = useVideoSettings()
  //const micSettings = useMicSettings()
  //const speakerSettings = useSpeakerSettings()
  //const pushToTalkSettings = usePushToTalkSettings()
  const backgroundBlur = useBackgroundBlurSettings()
  const invitePeople = useInvitePeople()

  const callSyncDevices = debounce(() => {
    dispatch(syncDevices())
  }, 1000)

  useEffect(() => {
    log.info('Setting up...')

    callSyncDevices()

    navigator.mediaDevices.ondevicechange = function (event) {
      log.info('A new device has been connected', event)
      callSyncDevices()
    }
  }, [])

  const [
    currentCameraLabel,
    currentMicLabel,
    currentSpeakerLabel,
    pushToTalkVideo,
    backgroundBlurLabel,
  ] = useSelector((state) => [
    selectors.settings.getVideoInputDeviceLabelById(
      state,
      selectors.settings.getVideoInputDeviceId(state) || ''
    ),
    selectors.settings.getAudioInputDeviceLabelById(
      state,
      selectors.settings.getAudioInputDeviceId(state) || ''
    ),
    selectors.settings.getAudioOutputDeviceLabelById(
      state,
      selectors.settings.getAudioOutputDeviceId(state) || ''
    ),
    selectors.settings.isPushToTalkVideoOn(state),
    selectors.settings.getBackgroundBlurLabel(state),
  ])

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== 'settings') return
    commandPalette.setCommands(buildCommandList())
  }, [
    commandPalette.isOpen,
    commandPalette.id,
    currentCameraLabel,
    currentMicLabel,
    currentSpeakerLabel,
  ])

  return {
    modal: modalProps,
    commands: buildCommandList,
    open: () => {
      commandPalette.open(buildCommandList(), modalProps())
    },
  }

  function modalProps(parentModal?: () => ModalProps) {
    return {
      id: 'settings',
      title: 'Settings',
      icon: 'sliders',
      placeholder: 'Set the stage.',
      preview: (_: { selectedValue?: unknown }) => <CallSettingsPreview />,
      search: (commands: Command[], query: string) =>
        performSearch(commands, query, { tolerant: true }),
      parentModal,
    }
  }

  function buildCommandList(): Command[] {
    return [
      /*{
        id: 'video-settings',
        icon: 'video',
        name: 'Camera',
        hint: hint(currentCameraLabel),
        palette: videoSettings,
      },
      {
        id: 'mic-settings',
        icon: 'mic',
        name: 'Microphone',
        hint: hint(currentMicLabel),
        palette: micSettings,
      },
      {
        id: 'speaker-settings',
        icon: 'speaker',
        name: 'Speakers',
        hint: hint(currentSpeakerLabel),
        palette: speakerSettings,
      },
      {
        id: 'push-to-talk-settings',
        icon: 'press',
        name: 'Push-to-Talk',
        hint: pushToTalkVideo ? 'Camera & Microphone' : 'Only Microphone',
        palette: pushToTalkSettings,
      },
      {
        id: 'background-blur-settings',
        icon: 'dots',
        name: 'Background Blur',
        hint: backgroundBlurLabel,
        palette: backgroundBlur,
      },*/
      {
        id: 'back',
        icon: 'undo',
        name: 'Back',
        pin: true,
        callback: () => commandPalette.close(),
      },
    ]
  }
}

export function SettingsProvider(props: Props) {
  const settings = useSettings()
  const { useRegister } = useCommandRegistry()

  useHotkeys(
    'meta+s',
    settings.open,
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    []
  )

  useRegister((register) => {
    /*register(`Settings`, openSettings, {
      icon: 'sliders',
      type: CommandType.Settings,
      palette: settings,
      })*/

    register('Developer: Delete offline database', deleteOfflineDB, {
      keywords: ['db', 'clear', 'clean', 'cache'],
    })

    register(`Sign out`, logout, {
      icon: 'logout',
      type: CommandType.AlterSession,
      keywords: ['logout', 'log out'],
    })

    function openSettings() {
      //commandPalette.open(settings.modal())
    }
  }, [])

  return <></>

  function logout() {
    fetch('/users/log_out', {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        // @ts-ignore
        'x-csrf-token': document.querySelector('meta[name=csrf-token]').content,
      },
    }).then((response) => {
      window.location.href = '/login'
    })
  }

  function deleteOfflineDB() {
    deleteIDBDatabase()
      .then(() => {
        window.location.reload()
      })
      .catch((err: Error) => {
        log.error('Can not delete idb', err)
      })
  }
}

function hint(label: string | undefined): string {
  if (!label) return ''
  return label
    .replace(/^Default - /, '')
    .replace(/\([^\(\)]+\)/g, '')
    .replace(/\sMicrophone\s/, ' ')
    .replace(/\sSpeakers\s/, ' ')
    .replace(/\sCamera\s/, ' ')
    .trim()
}
