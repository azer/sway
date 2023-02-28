import * as users from './users'
import * as session from './session'
import * as workspaces from './workspaces'
import * as memberships from './memberships'
import * as rooms from 'features/Room/selectors'
import * as focus from 'features/Focus/selectors'
import * as dock from 'features/Dock/selectors'
import * as call from 'features/Call/selectors'
import * as settings from 'features/Settings/selectors'
import * as statuses from './status'
import * as presence from 'features/Presence/selectors'
import * as electronTray from 'features/ElectronTray/selectors'

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
  statuses,
  presence,
  electronTray,
}
