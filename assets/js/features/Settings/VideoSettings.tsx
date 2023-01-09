import React, { useEffect } from 'react'
import selectors from 'selectors'
import {
  findCommandById,
  performSearch,
  useCommandRegistry,
} from 'features/CommandRegistry'
import {
  DailyProvider,
  useAudioTrack,
  useDaily,
  useDevices,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react-hooks'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import logger from 'lib/log'
import { setVideoInputDeviceId, setVideoInputOff } from './slice'
import { useSelector, useDispatch } from 'state'
import { VideoSettingsPreview } from './VideoSettingsPreview'

const log = logger('settings/video')
const dialogId = 'camera-settings'

export function useVideoSettings() {
  const dispatch = useDispatch()
  const [isOff, selectedDeviceId, allDevices] = useSelector((state) => [
    selectors.settings.isVideoInputOff(state),
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.allVideoInputDevices(state),
  ])

  const currentSelectedId = isOff ? 'off' : selectedDeviceId
  const commandPalette = useCommandPalette()
  const { useRegister } = useCommandRegistry()

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, allDevices])

  useRegister(
    (register) => {
      register(`Camera Settings`, open, {
        icon: 'video',
        type: CommandType.Settings,
        palette: {
          modal: modalProps,
          commands: buildCommandList,
        },
      })

      register(`Turn off the camera`, turnCamOff, {
        icon: 'video-off',
        type: CommandType.Settings,
        when: !isOff,
      })

      register(`Turn on the camera`, turnCamOn, {
        icon: 'video',
        type: CommandType.Settings,
        when: isOff,
      })

      for (const device of allDevices) {
        register(`Switch camera to ${device.label}`, switchDevice(device.id), {
          icon: 'video',
          type: CommandType.Settings,
          when: selectedDeviceId !== device.id,
        })
      }
    },
    [isOff, selectedDeviceId, allDevices]
  )

  return {
    modal: modalProps,
    commands: buildCommandList,
    open,
  }

  function open() {
    commandPalette.open(buildCommandList(), modalProps())
  }

  function modalProps(parentModal?: () => ModalProps) {
    return {
      id: dialogId,
      title: 'Camera Settings',
      icon: 'video',
      placeholder: 'Choose your lens.',
      selectedId: currentSelectedId,
      preview: (props: { selectedValue?: unknown }) => (
        <VideoSettingsPreview deviceId={props.selectedValue as string} />
      ),
      search: (commands: Command[], query: string) =>
        performSearch(commands, query, { tolerant: true }),
      parentModal,
    }
  }

  function buildCommandList() {
    const commands: Command[] = [
      {
        id: 'back',
        value: currentSelectedId,
        icon: 'undo',
        name: 'Back',
        pin: true,
      },
    ]

    for (const device of allDevices) {
      commands.push({
        id: device.id,
        value: device.id,
        icon: currentSelectedId == device.id ? 'checkmark' : '',
        name: device.label,
        callback: switchDevice(device.id),
      })
    }

    commands.push({
      id: 'off',
      value: 'off',
      icon: isOff ? 'checkmark' : '',
      name: 'Off',
      callback: turnCamOff,
    })

    return commands
  }

  function turnCamOff() {
    dispatch(setVideoInputOff(true))
  }

  function turnCamOn() {
    dispatch(setVideoInputOff(true))
  }

  function switchDevice(deviceId: string) {
    return function () {
      dispatch(setVideoInputDeviceId(deviceId))
      dispatch(setVideoInputOff(false))
    }
  }
}
