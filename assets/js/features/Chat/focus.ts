export interface ChatFocus {
  input: boolean
  message?: {
    id: string
    editing: boolean
  }
}

export const initialChatFocus: ChatFocus = {
  input: true,
}
