import { ChatFocus } from 'features/Chat/focus'

export enum SidebarContent {
  User = 'user',
  Chat = 'chat',
}

export interface SidebarFocus {
  isOpen: boolean
  content: SidebarContent
  user?: {
    id: string
  }
  chat?: ChatFocus
}

export const initialSidebarFocus: SidebarFocus = {
  isOpen: true,
  content: SidebarContent.Chat,
}
