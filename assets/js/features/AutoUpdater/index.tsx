import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { ConnectionState } from 'features/Dock/slice'
import { logger } from 'lib/log'
import { isElectron } from 'lib/electron'

interface Props {}

const SIX_HOURS: number = 6 * 60 * 60 * 1000

const log = logger('auto-update')

export function AutoUpdateProvider(props: Props) {
  const [mountedAt, setMountedAt] = useState(0)

  // const dispatch = useDispatch()
  const [hasWindowFocus, isWindowVisible, isActive, isOnline] = useSelector(
    (state) => [
      selectors.focus.hasWindowFocus(state),
      selectors.focus.isWindowVisible(state),
      selectors.presence.isLocalUserActive(state),
      selectors.dock.getSelfConnectionStatus(state)?.internet ===
        ConnectionState.Connected,
    ]
  )

  const shouldRefreshWindow =
    isElectron &&
    !hasWindowFocus &&
    !isActive &&
    isOnline &&
    mountedAt > 0 &&
    mountedAt < Date.now() - SIX_HOURS

  useEffect(() => {
    setMountedAt(Date.now())
  }, [])

  useEffect(() => {
    if (shouldRefreshWindow) {
      document.location.reload()
    }
  }, [shouldRefreshWindow])

  return <></>
}
