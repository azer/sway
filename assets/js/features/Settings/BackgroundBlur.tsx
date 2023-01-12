import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { performSearch, useCommandRegistry } from 'features/CommandRegistry'
import {
  Command,
  CommandType,
  ModalProps,
  useCommandPalette,
} from 'features/CommandPalette'
import logger from 'lib/log'
import {
  setBackgroundBlur,
  setVideoInputDeviceId,
  setVideoInputOff,
} from './slice'
import { useSelector, useDispatch } from 'state'
import { VideoSettingsPreview } from './VideoSettingsPreview'
import { BlurSettingsPreview } from './BlurSettingsPreview'

const log = logger('settings/video')
const dialogId = 'background-blur-settings'

export function useBackgroundBlurSettings() {
  const dispatch = useDispatch()
  const [blur] = useSelector((state) => [
    selectors.settings.getBackgroundBlurValue(state),
  ])

  const commandPalette = useCommandPalette()
  const { useRegister } = useCommandRegistry()

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return
    commandPalette.setCommands(buildCommandList())
  }, [commandPalette.isOpen, commandPalette.id, blur])

  useRegister((register) => {
    register(`Blur Effect Settings`, open, {
      icon: 'dots',
      type: CommandType.Settings,
      palette: {
        modal: modalProps,
        commands: buildCommandList,
      },
    })
  }, [])

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
      title: 'Background Blur',
      icon: 'dots',
      placeholder: 'Mask your surroundings.',
      selectedId: 'blur-pct-' + blur,
      preview: (props: { selectedValue?: unknown }) => {
        let value = props.selectedValue

        if (typeof value === 'string') {
          value = Number(value.replace(/[^\d]+/, ''))
        }

        return <BlurSettingsPreview value={value as number} />
      },
      search: (commands: Command[], query: string) => {
        const matching = performSearch(commands, query)
        const n = Number(query.trim().replace(/[^\d]+/g, ''))

        if (
          !matching.find((r) => r.value === n / 100) &&
          typeof n === 'number'
        ) {
          const value = n / 100
          return [
            {
              id: 'blur-pct-' + value,
              value,
              icon: blur == value ? 'checkmark' : '',
              name: n + '%',
              callback: setBlurValue(value),
            },
          ].concat(matching)
        }

        return matching
      },
      parentModal,
    }
  }

  function buildCommandList() {
    const commands: Command[] = [
      {
        id: 'back',
        value: blur,
        icon: 'undo',
        name: 'Back',
        pin: true,
      },
    ]

    commands.push({
      id: 'off',
      value: 0,
      icon: blur === 0 ? 'checkmark' : '',
      name: 'Off',
      callback: setBlurValue(0),
    })

    let i = 0
    let value = 0
    let label = ''
    while (++i < 6) {
      value = (i * 2) / 10
      label = value * 100 + '%'

      commands.push({
        id: 'blur-pct-' + value,
        value,
        icon: blur == value ? 'checkmark' : '',
        name: label,
        callback: setBlurValue(value),
      })
    }

    return commands
  }

  function setBlurValue(n: number) {
    return function () {
      dispatch(setBackgroundBlur(n))
    }
  }
}
