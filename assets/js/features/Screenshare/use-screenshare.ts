import { useScreenShare as useDailyScreenShare } from '@daily-co/daily-react-hooks'
import { useCommandPalette } from 'features/CommandPalette'
import { isElectron } from 'lib/electron'
import { logger } from 'lib/log'
import { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'

const dialogId = 'screenshare-sources'
const log = logger('use-screenshare')

interface ElectronDesktopCapturerSource {
  display_id: string
  id: string
  name: string
  thumbnail: {
    toPNG: () => {}
    toJPEG: () => {}
  }
}

export function useScreenShare() {
  const { isSharingScreen, startScreenShare, stopScreenShare } =
    useDailyScreenShare()

  const [capturerSources, setCapturerSources] = useState<
    ElectronDesktopCapturerSource[]
  >([])
  const [isActive] = useSelector((state) => [
    selectors.presence.isLocalUserActive(state),
  ])

  const commandPalette = useCommandPalette()

  useEffect(() => {
    if (!commandPalette.isOpen || commandPalette.id !== dialogId) return

    log.info('Reset command palette commands', capturerSources)
    commandPalette.setCommands(
      capturerSources.sort(sortCaptureSources).map((source) => {
        return {
          id: source.id,
          name: source.name,
          icon: source.id.startsWith('screen:')
            ? 'monitor'
            : 'picture-in-picture',
          callback: () => startScreenShare({ chromeMediaSourceId: source.id }),
        }
      })
    )
  }, [commandPalette.isOpen, commandPalette.id, capturerSources])

  return {
    start,
    stop,
    toggle,
    isSharingScreen,
  }

  function start() {
    if (!isActive) {
      log.error('User is not active, can not start screen share.')
      return
    }

    if (!isElectron) return startScreenShare()

    commandPalette.open([], {
      id: dialogId,
      title: 'Present your screen',
      placeholder: 'Choose what to share',
      icon: 'projector',
      preview: (props: { selectedValue?: unknown }) => {
        return <div>hi</div>
      },
    })

    //startScreenShare({})
    // @ts-ignore
    window.electronDesktopCapturer.getSources().then(async (sources) => {
      // Here you can present the sources to the user and let them choose one.
      // You can use their names and thumbnails for the user interface.
      // For the sake of simplicity, let's assume the user picked the first source.

      setCapturerSources(sources as ElectronDesktopCapturerSource[])

      log.info('screenshare sources:', sources)
    })
  }

  function stop() {
    log.info('Stop screensharing')

    stopScreenShare()
  }

  function toggle() {
    if (isSharingScreen) {
      stop()
    } else {
      start()
    }
  }
}

function sortCaptureSources(
  a: ElectronDesktopCapturerSource,
  b: ElectronDesktopCapturerSource
): number {
  if (a.id.startsWith('screen') && !b.id.startsWith('screen')) {
    return -1
  } else if (!a.id.startsWith('Screen') && b.id.startsWith('screen')) {
    return 1
  }

  return a.name.localeCompare(b.name)
}
