import { useScreenShare as useDailyScreenShare } from '@daily-co/daily-react-hooks'
import { useCommandPalette } from 'features/CommandPalette'
import { isElectron } from 'lib/electron'
import { logger } from 'lib/log'
import selectors from 'selectors'
import { useDispatch, useSelector } from 'state'
import { screenShareWindowSelectionDialogId } from './Provider'
import {
  startScreensharing,
  stopScreensharing,
  toggleScreensharing,
} from './slice'

const log = logger('use-screenshare')

export function useScreenShare() {
  const dispatch = useDispatch()
  const commandPalette = useCommandPalette()

  const [isActive, isScreenSharing] = useSelector((state) => [
    selectors.presence.isLocalUserActive(state),
    selectors.screenshare.isScreenSharing(state),
  ])

  return {
    start,
    stop,
    toggle,
  }

  function start() {
    if (!isActive) {
      log.error('User is not active, can not start screen share.')
      return
    }

    if (!isElectron) {
      dispatch(startScreensharing())
      return
    }

    commandPalette.open([], {
      id: screenShareWindowSelectionDialogId,
      title: 'Present your screen',
      placeholder: 'Choose what to share',
      icon: 'projector',
    })
  }

  function stop() {
    log.info('Stop screensharing')
    dispatch(stopScreensharing())
  }

  function toggle() {
    if (isScreenSharing) {
      stop()
    } else {
      start()
    }
  }
}
