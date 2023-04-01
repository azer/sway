import { entities, RootState } from 'state'

export function getById(
  state: RootState,
  id: string
): entities.ChatMessage | undefined {
  return state.entities.chat_messages[id]
}
