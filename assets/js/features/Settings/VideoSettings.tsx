import React, { useEffect } from 'react'
import selectors from 'selectors'
import { findCommandById, performSearch } from 'features/CommandRegistry'
import {
  DailyProvider,
  useAudioTrack,
  useDaily,
  useDevices,
  useLocalParticipant,
  useVideoTrack,
} from '@daily-co/daily-react-hooks'
import { Command, ModalProps, useCommandPalette } from 'features/CommandPalette'
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

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, allDevices])

  return {
    modal: modalProps,
    commands: buildCommandList,
    open: () => {
      commandPalette.open(buildCommandList(), modalProps())
    },
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
        callback: () => setDevice(device.id),
      })
    }

    commands.push({
      id: 'off',
      value: 'off',
      icon: isOff ? 'checkmark' : '',
      name: 'Off',
      callback: () => dispatch(setVideoInputOff(true)),
    })

    return commands
  }

  function setDevice(id: string) {
    dispatch(setVideoInputDeviceId(id))
    dispatch(setVideoInputOff(false))
  }
}
