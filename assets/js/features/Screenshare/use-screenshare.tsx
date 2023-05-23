import { useScreenShare as useDailyScreenShare } from '@daily-co/daily-react-hooks'
import { useCommandPalette } from 'features/CommandPalette'
import { isElectron } from 'lib/electron'
import { logger } from 'lib/log'
import { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import React from 'react'
import { styled } from 'themes'
import { Prop, Table, Value } from 'features/Settings/CallSettingsPreview'

const dialogId = 'screenshare-sources'
const log = logger('use-screenshare')

interface ElectronDesktopCapturerSource {
  display_id: string
  id: string
  name: string
  thumbnail: string
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
  const isCommandPaletteOpen = commandPalette.isOpen === true && commandPalette.id === dialogId

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
          callback: () => startScreenShare({ chromeMediaSourceId: source.id }),
        }
      })
    )

    commandPalette.setProps(modalProps())
  }, [commandPalette.isOpen, commandPalette.id, capturerSources])

  useEffect(() => {
    if (isCommandPaletteOpen && capturerSources.length === 0) {
      loadDesktopCapturerSources()
    }
  }, [isCommandPaletteOpen])

  return {
    start,
    stop,
    toggle,
    isSharingScreen,
    commandPalette: modalProps
  }

  function start() {
    if (!isActive) {
      log.error('User is not active, can not start screen share.')
      return
    }

    if (!isElectron) return startScreenShare()

    commandPalette.open([], modalProps())
    loadDesktopCapturerSources()
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
      id: dialogId,
      title: 'Present your screen',
      placeholder: 'Choose what to share',
      icon: 'projector',
      preview: (props: { selectedValue?: unknown }) => {
        const source = capturerSources.find(r => r.id === props.selectedValue)

        log.info('Source preview:', source, props.selectedValue)

        return <Preview>
          <Img src={source ? source.thumbnail : ''} />
          <Table>
            <Prop>Share</Prop>
            <Value>
              {source?.name}
            </Value>
          </Table>
        </Preview>
      }
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

const Preview = styled('div', {
  width: '100%',
  aspectRatio: '1',
  padding: '20px'
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
  }
})
