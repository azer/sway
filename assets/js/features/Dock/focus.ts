export enum DockFocusRegion {
  Status = 'workspace.room.dock.status',
  EmojiSearch = 'workspace.room.dock.emoji',
  Message = 'workspace.room.dock.message',
  CallControls = 'workspace.room.dock.call_controls',
}

export interface DockFocus {
  region: DockFocusRegion
  emoji?: {
    id: ''
  }
}

export const initialDockFocus: DockFocus = {
  region: DockFocusRegion.Message,
}
