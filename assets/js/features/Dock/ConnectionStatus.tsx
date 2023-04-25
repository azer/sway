import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { ConnectionState } from './slice'
import { useSelector } from 'state'
import { useNetwork } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'

interface Props {}

const log = logger('connection-status')

export function ConnectionStatus(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const [showStatus, setShowStatus] = useState(true)
  const [networkQuality, setNetworkQuality] =
    useState<'good' | 'low' | 'very-low'>('good')

  const network = useNetwork()

  const [connectionStatus] = useSelector((state) => [
    selectors.dock.getStatusMessage(state),
  ])

  const badNetworkQuality = network.threshold !== 'good'

  useEffect(() => {
    if (connectionStatus.status === ConnectionState.Connected) {
      setShowStatus(false)
    } else {
      setShowStatus(true)
    }
  }, [connectionStatus.status])

  useEffect(() => {
    log.info('Network quality:', network.threshold)
    setNetworkQuality(network.threshold)
  }, [network.threshold])

  return (
    <Container
      status={connectionStatus.status}
      visible={showStatus || !badNetworkQuality}
      badNetworkQuality={badNetworkQuality}
    >
      {showStatus ? connectionStatus.msg : null}
      {!showStatus && badNetworkQuality
        ? 'Poor connection. Check your network.'
        : null}
    </Container>
  )
}

const Container = styled('div', {
  position: 'absolute',
  width: '250px',
  left: 'calc(50% - 125px)',
  top: '-20px',
  color: 'rgba(255, 255, 255, 0.35)',
  fontSize: '$small',
  opacity: '1',
  fade: { props: ['opacity'], time: 0.1 },
  label: true,
  variants: {
    visible: {
      true: {
        opacity: '1',
      },
    },
    status: {
      ready: {
        color: '$dockIconReadyBg',
      },
      failed: {
        color: '$dockIconFailedBg',
      },
      disconnected: {
        color: '$dockIconFailedBg',
      },
      connected: {
        color: '$dockIconConnectedBg',
      },
      connecting: {
        color: 'rgba(255, 255, 255, 0.35)',
      },
      timeout: {
        background: '$dockIconFailedFg',
      },
    },
    badNetworkQuality: {
      true: {
        color: '$dockIconFailedBg',
      },
    },
  },
})
