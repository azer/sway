import { entities, RootState } from 'state'

export function getById(
  state: RootState,
  id: string
): entities.ChatMessage | undefined {
  return state.entities.chat_messages[id]
}

export function sortByDate(
  a: entities.ChatMessage,
  b: entities.ChatMessage
): number {
  const ad = new Date(a.inserted_at)
  const bd = new Date(b.inserted_at)

  if (ad < bd) return -1
  if (bd > ad) return 1
  return 0
}
