import React, { useContext, useEffect, useState } from 'react'
import selectors from 'selectors'
import { setWindowCreated, setWindowOpen } from './slice'
import { useSelector, useDispatch } from 'state'
import { ipcRenderer, isElectron, sendMessage, setTray } from 'lib/electron'
import { logger } from 'lib/log'
import { usePresence } from 'features/Presence/use-presence'
import { ElectronWindow, TrayWindowRequest } from '.'
import { SocketContext } from 'features/UserSocket'

interface Props {}

const log = logger('electron-tray-provider')

export function ElectronTrayProvider(props: Props) {
  if (!isElectron) {
    return null
  }

  log.info('Initializing')

  const dispatch = useDispatch()
  const presence = usePresence()
  const ctx = useContext(SocketContext)

  const [trayStateRequested, setTrayStateRequested] = useState(false)

  const [isActive, users, trayWindowState, isTrayWindowOpen] = useSelector(
    (state) => [
      selectors.presence.isLocalUserActive(state),
      selectors.rooms.getOtherUsersInSameRoom(state),
      selectors.electronTray.trayWindowState(state),
      selectors.electronTray.isTrayWindowOpen(state),
    ]
  )

  useEffect(() => {
    ipcRenderer.on(ElectronWindow.Main, onMessage)
    return () => {
      ipcRenderer.removeListener(ElectronWindow.Main, onMessage)
    }
  }, [presence.channel, presence.localStatus])

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

    //log.info('Send state:', snapshotForTrayWindow)
  }, [])

  useEffect(() => {
    if (isTrayWindowOpen) {
      log.info('State changed, send it to tray window', isTrayWindowOpen)

      sendMessage(ElectronWindow.Tray, {
        provideState: { state: trayWindowState },
      })
    }
  }, [isTrayWindowOpen, trayWindowState])

  useEffect(() => {
    if (!trayStateRequested) return

    setTrayStateRequested(false)

    log.info('Sending state')

    sendMessage(ElectronWindow.Tray, {
      provideState: { state: trayWindowState },
    })
  }, [trayStateRequested])

  return <></>

  function onMessage(event: Event, msg: string) {
    log.info('Message received', msg)

    const parsed = JSON.parse(msg) as TrayWindowRequest
    if (parsed.setWindowOpen) {
      dispatch(setWindowOpen(parsed.setWindowOpen.open))
      return
    }

    if (parsed.setWindowCreated) {
      dispatch(setWindowCreated(parsed.setWindowCreated.created))
      return
    }

    if (parsed.requestState) {
      setTrayStateRequested(true)
      return
    }

    if (parsed.setCameraOn) {
      presence.setMedia({ camera: parsed.setCameraOn.on })
      return
    }

    if (parsed.setMicOn) {
      presence.setMedia({ mic: parsed.setMicOn.on })
      return
    }

    if (parsed.setSpeakerOn) {
      presence.setMedia({ speaker: parsed.setSpeakerOn.on })
      return
    }

    if (parsed.joinCall) {
      presence.setMedia({ camera: true, mic: true })
      return
    }

    if (parsed.leaveCall) {
      presence.setMedia({ camera: false, mic: false })
      return
    }

    if (parsed.saveStatusEmoji) {
      presence.setEmoji(parsed.saveStatusEmoji.emoji)
      return
    }

    if (parsed.saveStatusMessage) {
      presence.setMessage(parsed.saveStatusMessage.message)
      return
    }

    if (parsed.savePresenceStatus) {
      presence.setMode(parsed.savePresenceStatus.status)
      return
    }

    log.error('No matching action', parsed)
  }
}
