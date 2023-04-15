import { ChatFocus } from 'features/Chat/focus'

export enum SidebarContent {
  User = 'user',
  Chat = 'chat',
  Room = 'room',
}

export interface SidebarFocus {
  isOpen: boolean
  content: SidebarContent
  user?: {
    id: string
  }
  chat?: ChatFocus
  room?: {
    id: string
  }
}

export const initialSidebarFocus: SidebarFocus = {
  isOpen: false,
  content: SidebarContent.Chat,
}
