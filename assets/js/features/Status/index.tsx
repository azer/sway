import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import logger from 'lib/log'
import Mirror from './Mirror'
import PresenceMode from './PresenceMode'
import Button from './Button'

interface Props {
  roomId: string
}

const log = logger('status-tray')

export default function StatusTray(props: Props) {
  // const dispatch = useDispatch()
  return (
    <Container>
      <Mirror />
      <Separator />
      <PresenceMode />
      <Separator group />
      <Button icon="sliders" label="Options" />
    </Container>
  )
}

const Container = styled('nav', {
  display: 'flex',
  color: '$statusTrayFg',
  background: '$statusTrayBg',
  border: '1px solid $statusTrayBorderColor',
  round: 'xlarge',
  margin: '0 auto 20px auto',
  padding: '12px 12px',
})

const Separator = styled('div', {
  width: '1px',
  height: 'calc(100% - 16px)',
  background: 'rgba(255, 255, 255, 0.05)',
  margin: '8px 12px',
  variants: {
    group: {
      true: {
        background: 'transparent',
        margin: '8px 4px',
      },
    },
  },
})
