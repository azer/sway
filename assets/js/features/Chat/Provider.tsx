import React from 'react'
import { useUserSocket } from 'features/UserSocket'
import { logger } from 'lib/log'
import { useEffect } from 'react'
import { add, addBatch, ChatMessage, Row } from 'state/entities'
import { useDispatch, useSelector } from 'state'
import { addNewMessages, setMessages } from './slice'
import selectors from 'selectors'

const log = logger('chat/provider')

interface Props {}

export function ChatProvider(props: Props) {
  const { channel } = useUserSocket()
  const dispatch = useDispatch()
  const [roomId] = useSelector((state) => [
    selectors.rooms.getFocusedRoom(state)?.id,
  ])

  useEffect(() => {
    if (!channel) return

    log.info('Listening for chat messages')

    channel?.on(
      'chat:new_message',
      (payload: { message: Row<ChatMessage> }) => {
        dispatch(add(payload.message))
        dispatch(
          addNewMessages({
            roomId: payload.message.data.room_id,
            messages: [payload.message.id],
          })
        )
      }
    )

    channel?.on(
      'chat:list_messages',
      (payload: { room_id: string; messages: Row<ChatMessage>[] }) => {
        log.info('Received list of messages', payload.messages)

        dispatch(addBatch(payload.messages))
        dispatch(
          setMessages({
            roomId: payload.room_id,
            messages: payload.messages.map((m) => m.id),
          })
        )
      }
    )
  }, [!!channel])

  useEffect(() => {
    if (!channel || !roomId) return

    log.info('list chat messages', roomId)

    channel?.push('chat:list_messages', { room_id: roomId })
  }, [!!channel, roomId])

  return <></>
}
