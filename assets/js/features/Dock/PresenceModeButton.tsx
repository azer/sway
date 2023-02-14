import React from 'react'
import selectors from 'selectors'
import { logger } from 'lib/log'
import { useSelector, useDispatch } from 'state'
import { PresenceModeIcon } from 'components/PresenceModeIcon'
import { styled } from 'themes'
import { usePresenceSettings } from 'features/Settings/PresenceSettings'
import { Tooltip } from 'components/Tooltip'

interface Props {}

const log = logger('status/presence')

export function PresenceModeButton(props: Props) {
  const presenceSettings = usePresenceSettings()

  const [presence, isActive] = useSelector((state) => [
    selectors.presence.getSelfStatus(state),
    selectors.presence.isLocalUserActive(state),
  ])

  return (
    <Button onClick={presenceSettings.open}>
      <Tooltip
        content={
          !isActive ? 'Become active' : `Switch to ${presence.status} mode`
        }
        shortcut={['Space']}
      >
        <Circle>
          <PresenceModeIcon
            active={isActive}
            mode={presence.status}
            onClick={presenceSettings.open}
          />
        </Circle>
      </Tooltip>
    </Button>
  )
}

const Button = styled('div', {
  height: '100%',
  aspectRatio: '1',
  center: true,
  round: 'large',
  space: { inner: [0, 2], gap: 1 },
  border: '1px solid rgba(255, 255, 255, 0.02)',
  boxShadow: 'rgb(0 0 0 / 5%) 0px 0px 4px',
  colors: {
    bg: '$dockButtonBg',
    fg: '$dockButtonFg',
  },
  '& svg': {
    width: '20px',
    height: '20px',
    margin: '0 auto',
    overflow: 'visible',
  },
  '&:hover': {
    background: '$dockButtonHoverBg',
    color: '$dockButtonHoverFg',
    borderColor: 'rgba(255, 255, 255, 0.03),',
  },
})

const Circle = styled('div', {
  background: 'rgba(255, 255, 255, 0.02)',
  width: '50px',
  height: '50px',
  round: 'circle',
  center: true,
})
