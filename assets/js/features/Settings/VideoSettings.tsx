import React, { useEffect } from 'react'
import selectors from 'selectors'
import { performSearch, useCommandRegistry } from 'features/CommandRegistry'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import { logger } from 'lib/log'
import { setVideoInputDeviceId } from './slice'
import { useSelector, useDispatch } from 'state'
import { VideoSettingsPreview } from './VideoSettingsPreview'
import { useHotkeys } from 'react-hotkeys-hook'
import { useStatus } from 'features/Status/use-status'

const log = logger('settings/video')
const dialogId = 'camera-settings'

export function useVideoSettings() {
  const dispatch = useDispatch()
  const [isOn, selectedDeviceId, allDevices] = useSelector((state) => [
    selectors.status.getLocalStatus(state).camera_on,
    selectors.settings.getVideoInputDeviceId(state),
    selectors.settings.allVideoInputDevices(state),
  ])

  const commandPalette = useCommandPalette()
  const { useRegister } = useCommandRegistry()
  const presence = useStatus()

  useHotkeys(
    'meta+e',
    () => presence.setMedia({ camera: !isOn }),
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isOn, presence.setMedia]
  )

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, allDevices])

  useRegister(
    (register) => {
      /*register(`Camera Settings`, open, {
        icon: 'video',
        type: CommandType.Settings,

        palette: {
          modal: modalProps,
          commands: buildCommandList,
        },
      })*/

      register(
        `Turn off the camera`,
        () => presence.setMedia({ camera: false }),
        {
          icon: 'video-off',
          shortcut: ['cmd', 'e'],
          type: CommandType.Settings,
          when: isOn,
        }
      )

      register(
        `Turn on the camera`,
        () => presence.setMedia({ camera: true }),
        {
          shortcut: ['cmd', 'e'],
          icon: 'video',
          type: CommandType.Settings,
          when: !isOn,
        }
      )

      for (const device of allDevices) {
        register(`Switch camera to ${device.label}`, switchDevice(device.id), {
          icon: 'video',
          type: CommandType.Settings,
          when: selectedDeviceId !== device.id,
        })
      }
    },
    [isOn, selectedDeviceId, allDevices]
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
      selectedId: selectedDeviceId,
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
        value: selectedDeviceId,
        icon: 'undo',
        name: 'Back',
        pin: true,
      },
    ]

    for (const device of allDevices) {
      commands.push({
        id: device.id,
        value: device.id,
        icon: selectedDeviceId == device.id ? 'checkmark' : '',
        name: device.label,
        callback: switchDevice(device.id),
      })
    }

    return commands
  }

  function switchDevice(deviceId: string) {
    return function () {
      dispatch(setVideoInputDeviceId(deviceId))
    }
  }
}
