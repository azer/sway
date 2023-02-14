import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { performSearch } from 'features/CommandRegistry'
import { Command, ModalProps, useCommandPalette } from 'features/CommandPalette'
import { logger } from 'lib/log'
import { setAudioOutputDeviceId } from './slice'
import { useSelector, useDispatch } from 'state'
import { SpeakerSettingsPreview } from './SpeakerSettingsPreview'

const log = logger('settings/speaker')
const dialogId = 'speaker-settings'

export function useSpeakerSettings() {
  const dispatch = useDispatch()
  const [selectedDeviceId, allDevices] = useSelector((state) => [
    selectors.settings.getAudioOutputDeviceId(state),
    selectors.settings.allAudioOutputDevices(state),
  ])

  const commandPalette = useCommandPalette()

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, allDevices])

  return {
    commands: buildCommandList,
    modal: modalProps,
    open: () => {
      commandPalette.open(buildCommandList(), modalProps())
    },
  }

  function modalProps(parentModal?: () => ModalProps) {
    return {
      id: dialogId,
      title: 'Speaker Settings',
      icon: 'speaker',
      placeholder: 'Pick your speakers.',
      selectedId: selectedDeviceId,
      preview: (props: { selectedValue?: unknown }) => (
        <SpeakerSettingsPreview deviceId={props.selectedValue as string} />
      ),
      search: (commands: Command[], query: string) =>
        performSearch(commands, query, { tolerant: true }),
      parentModal,
    }
  }

  function buildCommandList(): Command[] {
    const commands: Command[] = [
      {
        id: 'back',
        value: selectedDeviceId,
        icon: 'undo',
        name: 'Back',
        pin: true,
        callback: () => commandPalette.close(),
      },
    ]

    for (const device of allDevices) {
      commands.push({
        id: device.id,
        value: device.id,
        icon: selectedDeviceId == device.id ? 'checkmark' : '',
        name: device.label,
        callback: () => setDevice(device.id),
      })
    }

    return commands
  }

  function setDevice(id: string) {
    dispatch(setAudioOutputDeviceId(id))
  }
}
