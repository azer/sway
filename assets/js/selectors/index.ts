import * as users from './users'
import * as session from './session'
import * as workspaces from './workspaces'
import * as memberships from './memberships'
import * as rooms from 'features/Room/selectors'
import * as focus from 'features/Focus/selectors'
import * as dock from 'features/Dock/selectors'
import * as call from 'features/Call/selectors'
import * as settings from 'features/Settings/selectors'
import * as status from 'features/Status/selectors'
import * as chatMessages from './chat-messages'
import * as presence from 'features/Presence/selectors'
import * as electronTray from 'features/ElectronTray/selectors'
import * as commandPalette from 'features/CommandPalette/selectors'
import * as taps from 'features/Tap/selectors'
import * as sidebar from 'features/Sidebar/selectors'
import * as roomMembers from 'features/RoomMembers/selectors'
import * as navigation from 'features/Navigation/selectors'
import * as chat from 'features/Chat/selectors'
import * as pip from 'features/PictureInPicture/selectors'
import * as onboarding from 'features/Onboarding/selectors'
import * as usersocket from 'features/UserSocket/selectors'
import * as autoUpdater from 'features/AutoUpdater/selectors'
import * as screenshare from 'features/Screenshare/selectors'
import * as userManagement from 'features/UserManagement/selectors'

export default {
  session,
  users,
  workspaces,
  memberships,
  rooms,
  focus,
  dock,
  call,
  settings,
  status,
  presence,
  electronTray,
  commandPalette,
  taps,
  sidebar,
  roomMembers,
  navigation,
  chat,
  chatMessages,
  pip,
  onboarding,
  usersocket,
  autoUpdater,
  screenshare,
  userManagement,
}
