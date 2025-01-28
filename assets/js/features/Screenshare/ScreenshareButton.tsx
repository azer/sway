import React from 'react'
import selectors from 'selectors'
import { Button } from 'features/Dock/Button'
import { useSelector, useDispatch } from 'state'
import { useScreenShare } from './use-screenshare'

interface Props {}

export function ScreenshareButton(props: Props) {
  const dispatch = useDispatch()
  const { toggle } = useScreenShare()

  const [isActive, isScreenSharing] = useSelector((state) => [
    selectors.status.isLocalUserActive(state),
    selectors.screenshare.isScreenSharing(state),
  ])

  if (!isActive) return <></>

  const label = isScreenSharing
    ? 'Stop presenting your screen'
    : 'Present your screen'

  return (
    <Button
      icon="projector"
      label={label}
      on={isScreenSharing}
      onClick={toggle}
      tooltipLabel={
        isScreenSharing ? 'Stop presenting screen' : 'Present your screen'
      }
    />
  )
}
