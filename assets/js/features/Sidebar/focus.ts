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
  chat?: {
    roomId: string
  }
}

export const initialSidebarFocus: SidebarFocus = {
  isOpen: false,
  content: SidebarContent.User,
}
