import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { sendMessage, setTray } from 'lib/electron'

interface Props {}

export function ElectronTrayProvider(props: Props) {
  // const dispatch = useDispatch()
  const [isActive, users, snapshotForTrayWindow] = useSelector((state) => [
    selectors.presence.isLocalUserActive(state),
    selectors.rooms.getOtherUsersInSameRoom(state),
    selectors.electronTray.snapshotForTrayWindow(state),
  ])

  useEffect(() => {
    if (!isActive) {
      setTray({
        image: users
          ? 'tray_icon_not_emptyTemplate.png'
          : 'tray_icon_emptyTemplate.png',
        tooltip: users.length ? `${users} in the room` : 'Open Sway',
      })
    } else {
      setTray({ image: 'tray_icon_activeTemplate.png', tooltip: 'Open Sway' })
    }

    sendMessage('tray-window', { state: snapshotForTrayWindow })
  }, [snapshotForTrayWindow])

  return <></>
}
