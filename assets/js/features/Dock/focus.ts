export enum DockFocusRegion {
  Status = 'status',
  EmojiSearch = 'emoji',
  Message = 'message',
  CallControls = 'call_controls',
}

export interface DockFocus {
  region: DockFocusRegion
  emoji?: {
    id: string | undefined
  }
}

export const initialDockFocus: DockFocus = {
  region: DockFocusRegion.Message,
}
