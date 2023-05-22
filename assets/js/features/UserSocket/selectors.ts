import { RootState } from 'state'
import selectors from 'selectors'
import { ConnectionState } from 'features/Dock/slice'

export function shouldReconnect(state: RootState): boolean {
  const conn = selectors.dock.getSelfConnectionStatus(state)
  return (
    conn?.swaySocket === ConnectionState.Disconnected &&
    conn.internet === ConnectionState.Connected
  )
}
