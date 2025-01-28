import React, { useEffect, useState } from 'react'
import { CommandType, useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useHotkeys } from 'react-hotkeys-hook'
import { logger } from 'lib/log'
import selectors from 'selectors'
import { useDispatch, useSelector } from 'state'
//import { useScreenShare } from './use-screenshare'
import { isElectron } from 'lib/electron'
import { styled } from 'themes'
import { Prop, Table, Value } from 'features/Settings/CallSettingsPreview'
import { startScreensharing, stopScreensharing } from './slice'
import { useScreenShare as useDailyScreenShare } from '@daily-co/daily-react-hooks'
import { useScreenShare } from './use-screenshare'

interface Props {}

interface ElectronDesktopCapturerSource {
  display_id: string
  id: string
  name: string
  thumbnail: string
}

export const screenShareWindowSelectionDialogId = 'screenshare-sources'
const log = logger('screenshare/provider')

export function ScreenshareProvider(props: Props) {
  const dispatch = useDispatch()

  const [capturerSources, setCapturerSources] = useState<
    ElectronDesktopCapturerSource[]
  >([])

  const { useRegister } = useCommandRegistry()
  const dailyScreenShare = useDailyScreenShare()
  const commandPalette = useCommandPalette()
  const { start, stop, toggle } = useScreenShare()

  const [isActive, isScreenSharing] = useSelector((state) => [
    selectors.status.isLocalUserActive(state),
    selectors.screenshare.isScreenSharing(state),
  ])

  const isCommandPaletteOpen =
    commandPalette.isOpen === true &&
    commandPalette.id === screenShareWindowSelectionDialogId

  useHotkeys(
    'meta+p',
    toggle,
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [isScreenSharing]
  )

  // User began screen sharing & not in electron
  // Electron is kicked off in the command palette
  useEffect(() => {
    if (!isElectron && isScreenSharing) {
      log.info('User hit screen share button on browser')
      dailyScreenShare.startScreenShare()
    }

    if (!isScreenSharing) {
      log.info('User stopped screen sharing - call Daily backend.')
      dailyScreenShare.stopScreenShare()
    }
  }, [isScreenSharing])

  // user screen sharing and leaves the call
  // turn off screen sharing
  useEffect(() => {
    if (!isActive && isScreenSharing) {
      dispatch(stopScreensharing())
    }
  }, [isScreenSharing, isActive, stop])

  useRegister(
    (register) => {
      log.info('[sway] Is sharing screen?', isScreenSharing)

      register('Present your screen', start, {
        icon: 'projector',
        keywords: ['share', 'start', 'screen'],
        shortcut: ['cmd', 'p'],
        type: CommandType.Misc,
        when: !isScreenSharing && isActive,
        palette: isElectron ? { commands: [], modal: modalProps } : undefined,
      })

      register('Stop presenting screen', stop, {
        icon: 'projector',
        keywords: ['share'],
        shortcut: ['cmd', 'p'],
        type: CommandType.Misc,
        when: isScreenSharing,
      })
    },
    [isActive, isScreenSharing]
  )

  useEffect(() => {
    if (isCommandPaletteOpen) {
      log.info('Command palette is on, load capturer sources.')
      loadDesktopCapturerSources()
    }
  }, [isCommandPaletteOpen])

  useEffect(() => {
    if (!isCommandPaletteOpen) return

    log.info('Reset command palette commands', capturerSources)

    commandPalette.setCommands(
      capturerSources.sort(sortCaptureSources).map((source) => {
        return {
          id: source.id,
          name: source.name,
          icon: source.id.startsWith('screen:')
            ? 'monitor'
            : 'picture-in-picture',
          callback: () => {
            dispatch(startScreensharing())
            dailyScreenShare.startScreenShare({
              chromeMediaSourceId: source.id,
            })
          },
        }
      })
    )

    commandPalette.setProps(modalProps())
  }, [isCommandPaletteOpen, capturerSources])

  return <></>

  function loadDesktopCapturerSources() {
    log.info('Load desktop capturer sources')

    // @ts-ignore
    window.electronDesktopCapturer.getSources().then((sources) => {
      setCapturerSources(sources as ElectronDesktopCapturerSource[])
      log.info('screenshare sources:', sources)
    })
  }

  function modalProps() {
    return {
      id: screenShareWindowSelectionDialogId,
      title: 'Present your screen',
      placeholder: 'Choose what to share',
      icon: 'projector',
      preview: (props: { selectedValue?: unknown }) => {
        const source = capturerSources.find((r) => r.id === props.selectedValue)

        log.info('Source preview:', source, props.selectedValue)

        return (
          <Preview>
            <Img src={source ? source.thumbnail : ''} />
            <Table>
              <Prop>Share</Prop>
              <Value>{source?.name}</Value>
            </Table>
          </Preview>
        )
      },
    }
  }
}

const Preview = styled('div', {
  width: '100%',
  aspectRatio: '1',
  padding: '20px',
})

const Img = styled('img', {
  display: 'block',
  width: '100%',
  background: '$gray1',
  height: 'auto',
  minHeight: '65%',
  maxHeight: '80%',
  round: 'small',
  marginBottom: '8px',
  position: 'relative',
  '&::after': {
    display: 'block',
    position: 'absolute',
    center: true,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '$gray1',
    color: '$gray5',
    textAlign: 'center',
    content: 'No Preview',
  },
})

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
