import React, { useEffect } from 'react'
import { useSelector } from 'state'
import { useDispatch } from 'state'
import { useParams } from 'react-router-dom'
import selectors from 'selectors'
import { RoomPage } from 'features/Room'
import { logger } from 'lib/log'
import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useHotkeys } from 'react-hotkeys-hook'
import { Shell } from 'features/Shell'

const log = logger('main-route')

export function MainRoute(): JSX.Element {
  const { commands, add } = useCommandRegistry()
  const commandPalette = useCommandPalette()

  const dispatch = useDispatch()
  const params = useParams()

  const [room] = useSelector((state) => [
    params.slug
      ? selectors.rooms.getRoomBySlug(state, params.slug)
      : selectors.rooms.getFocusedRoom(state),
  ])

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== 'cmdk') return
    commandPalette.setCommands(Object.values(commands))
  }, [commandPalette.isOpen, commandPalette.id, commands])

  useHotkeys(
    'meta+k',
    onPressCommandK,
    {
      enableOnFormTags: true,
    },
    [commandPalette.isOpen]
  )

  return (
    <Shell>
      <RoomPage id={room?.id || ''} />
    </Shell>
  )

  function onPressCommandK() {
    if (commandPalette.isOpen) commandPalette.close()

    log.info('Opening command palette')

    commandPalette.open([], {
      id: 'cmdk',
      title: 'Sway Command',
      icon: 'command',
      placeholder: '',
    })
  }
}
