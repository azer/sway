import React, { useContext, useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { setPipOpen, setTrayCreated, setTrayOpen } from './slice'
import { useSelector, useDispatch } from 'state'
import {
  ElectronMessage,
  getIpcRenderer,
  isElectron,
  messagePipWindow,
  messageTrayWindow,
  messageWindowManager,
  setTray,
} from 'lib/electron'
import { logger } from 'lib/log'
import { usePresence } from 'features/Presence/use-presence'
import { SocketContext } from 'features/UserSocket'

interface Props {}

const log = logger('electron-tray-provider')

export function ElectronTrayProvider(props: Props) {
  if (!isElectron) {
    log.info('Not running on Electron, return early')
    return null
  }

  log.info('Initializing')

  const dispatch = useDispatch()
  const presence = usePresence()
  const ctx = useContext(SocketContext)

  const [trayStateRequested, setTrayStateRequested] = useState(false)
  const pipFocusTimerRef = useRef<NodeJS.Timer | null>(null)
  const [mainWindowFocused, setMainWindowFocused] = useState(
    document.hasFocus()
  )

  const [isActive, users, trayWindowState, isTrayWindowOpen, isPipWindowOpen] =
    useSelector((state) => [
      selectors.presence.isLocalUserActive(state),
      selectors.rooms.getOtherUsersInSameRoom(state),
      selectors.electronTray.trayWindowState(state),
      selectors.electronTray.isTrayWindowOpen(state),
      selectors.electronTray.isPipWindowOpen(state),
    ])

  useEffect(() => {
    getIpcRenderer()?.on('message', onMessage)
    return () => {
      getIpcRenderer()?.removeListener('message', onMessage)
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
  }, [])

  useEffect(() => {
    if (isTrayWindowOpen) {
      log.info('State changed, send it to tray window', isTrayWindowOpen)

      messageTrayWindow({
        provideState: { state: trayWindowState },
      })
    }

    if (isPipWindowOpen) {
      log.info('State changed, send it to pip window')

      messagePipWindow({
        provideState: { state: trayWindowState },
      })
    }
  }, [isTrayWindowOpen, isPipWindowOpen, trayWindowState])

  useEffect(() => {
    if (!trayStateRequested) return

    setTrayStateRequested(false)

    log.info('Sending state')

    messageTrayWindow({
      provideState: { state: trayWindowState },
    })
  }, [trayStateRequested])

  useEffect(() => {
    if (pipFocusTimerRef.current) {
      clearTimeout(pipFocusTimerRef.current)
      pipFocusTimerRef.current = null
    }

    pipFocusTimerRef.current = setTimeout(() => {
      log.info(
        'Main window focused:',
        mainWindowFocused,
        isTrayWindowOpen,
        isPipWindowOpen,
        isActive,
        mainWindowFocused && isPipWindowOpen
      )

      if (
        !mainWindowFocused &&
        isActive &&
        !isTrayWindowOpen &&
        !isPipWindowOpen
      ) {
        messageWindowManager({
          showPipWindow: true,
        })
      } else if (mainWindowFocused && isPipWindowOpen) {
        log.info('hide')
        messageWindowManager({
          hidePipWindow: true,
        })
      } else if ((mainWindowFocused || !isActive) && isPipWindowOpen) {
        messageWindowManager({
          hidePipWindow: true,
        })
      }
    }, 70)
  }, [mainWindowFocused, isActive, isTrayWindowOpen, isPipWindowOpen])

  return <></>

  function onMessage(event: Event, parsed: ElectronMessage) {
    log.info('Message received', parsed)

    const payload = parsed.payload

    if (payload.isTrayWindowVisible !== undefined) {
      dispatch(setTrayOpen(payload.isTrayWindowVisible))
      return
    }

    if (payload.isPipWindowVisible !== undefined) {
      dispatch(setPipOpen(payload.isPipWindowVisible))
      return
    }

    if (payload.isMainWindowFocused !== undefined) {
      setMainWindowFocused(payload.isMainWindowFocused)
      return
    }

    if (payload.trayWindowCreated !== undefined) {
      dispatch(setTrayCreated(payload.trayWindowCreated))
      return
    }

    if (payload.requestState) {
      setTrayStateRequested(true)
      return
    }

    if (payload.setCameraOn) {
      presence.setMedia({ camera: payload.setCameraOn.on })
      return
    }

    if (payload.setMicOn) {
      presence.setMedia({ mic: payload.setMicOn.on })
      return
    }

    if (payload.setSpeakerOn) {
      presence.setMedia({ speaker: payload.setSpeakerOn.on })
      return
    }

    if (payload.joinCall) {
      presence.setMedia({ camera: true, mic: true })
      return
    }

    if (payload.leaveCall) {
      presence.setMedia({ camera: false, mic: false })
      return
    }

    if (payload.saveStatusEmoji) {
      presence.setEmoji(payload.saveStatusEmoji.emoji)
      return
    }

    if (payload.saveStatusMessage) {
      presence.setMessage(payload.saveStatusMessage.message)
      return
    }

    if (payload.savePresenceStatus) {
      presence.setMode(payload.savePresenceStatus.status)
      return
    }

    log.error('No matching action', parsed)
  }
}
