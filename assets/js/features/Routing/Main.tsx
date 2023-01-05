import React, { useEffect } from 'react'
import { useSelector } from 'state'
import { addInitialState } from 'state/entities'
import { useDispatch } from 'state'
import { useParams } from 'react-router-dom'
import selectors from 'selectors'
import { setRoomId } from 'features/Room/slice'
import Room from 'features/Room'
import logger from 'lib/log'
import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useHotkeys } from 'react-hotkeys-hook'
import { Shell } from 'features/Shell'

const log = logger('main-route')

export default function Main(): JSX.Element {
  const { commands, add } = useCommandRegistry()
  const commandPalette = useCommandPalette()

  const dispatch = useDispatch()
  const params = useParams()

  const [room] = useSelector((state) => [
    params.slug
      ? selectors.rooms.getRoomBySlug(state, params.slug)
      : selectors.rooms.getDefaultRoom(state),
  ])

  useEffect(() => {
    dispatch(addInitialState())
  }, [])

  useEffect(() => {
    if (room) {
      dispatch(setRoomId(room.id))
    }
  }, [room?.id, params.slug])

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
      <Room id={room?.id || ''} />
    </Shell>
  )

  function onPressCommandK() {
    if (commandPalette.isOpen) commandPalette.close()

    log.info('Opening command palette')

    commandPalette.open([], {
      id: 'cmdk',
      title: 'Bafa Command',
      icon: 'command',
      placeholder: '',
    })
  }
}
