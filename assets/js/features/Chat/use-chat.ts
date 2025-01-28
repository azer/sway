import { logger } from 'lib/log'
import { useUserSocket } from 'features/UserSocket'

const log = logger('chat/use-chat')

export function useChat() {
  const socket = useUserSocket()

  return {
    postMessage,
    editMessage,
  }

  function postMessage(userId: string, roomId: string, body: string) {
    log.info('Posting message', userId, roomId)

    socket.channel
      ?.push('chat:post_message', {
        room_id: roomId,
        user_id: userId,
        body,
      })
      .receive('ok', (msg) => {
        log.info('Message posted', msg)
      })
      .receive('error', (error) => {
        log.error('Failed', error)
      })
  }

  function editMessage(id: string, body: string) {
    log.info('Editing message', id)

    socket.channel
      ?.push('chat:edit_message', {
        id,
        body,
      })
      .receive('ok', (msg) => {
        log.info('Message edited', msg)
      })
      .receive('error', (error) => {
        log.error('Failed', error)
      })
  }
}
