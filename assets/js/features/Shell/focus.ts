import { RoomFocus, initialRoomFocus } from 'features/Room/focus'
//import { initialSidebarFocus, SidebarFocus } from 'features/Sidebar/focus'

export enum ShellFocusRegion {
  Navigation = 'navigation',
  Center = 'center',
  Sidebar = 'sidebar',
}

export interface ShellFocus {
  region: ShellFocusRegion
  //navigation: NavigationFocus
  center: {
    room: RoomFocus
  }
  //sidebar: SidebarFocus
}

export const initialShellFocus: ShellFocus = {
  region: ShellFocusRegion.Center,
  //navigation: initialNavigationFocus,
  center: {
    room: initialRoomFocus,
  },
  //sidebar: initialSidebarFocus,
}
