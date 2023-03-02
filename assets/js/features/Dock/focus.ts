export enum DockFocusRegion {
  Status = 'workspace.room.dock.status',
  EmojiSearch = 'workspace.room.dock.emoji',
  Message = 'workspace.room.dock.message',
}

export interface DockFocus {
  region: DockFocusRegion
  dropdownOpen: boolean
  emojiId?: string
  emojiInput?: string
}

export const initialDockFocus: DockFocus = {
  region: DockFocusRegion.Message,
  dropdownOpen: false,
}
