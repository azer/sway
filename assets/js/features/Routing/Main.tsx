import React, { useEffect } from 'react'
import Shell from 'features/Shell'
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

const log = logger('main-route')

export default function Main(): JSX.Element {
  const { search, commands } = useCommandRegistry()
  const { open, isOpen, close } = useCommandPalette()

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

  useHotkeys(
    'meta+k',
    onPressCommandK,
    {
      enableOnFormTags: true,
    },
    [isOpen, search, commands]
  )

  return (
    <Shell>
      <Room id={room?.id || ''} />
    </Shell>
  )

  function onPressCommandK() {
    if (isOpen) close()

    log.info('Opening command palette')

    open({
      title: 'Bafa Command',
      icon: 'command',
      placeholder: 'Search commands',
      search,
      callback: (selectedCommandId: string | undefined, query: string) => {
        if (!selectedCommandId) return

        const cmd = commands[selectedCommandId]
        if (!cmd || !cmd.callback) return

        cmd.callback(query)
      },
    })
  }
}
