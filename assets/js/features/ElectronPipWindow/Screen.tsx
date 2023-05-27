import { styled } from 'themes'
import React from 'react'
import { ScreenshareVideo } from 'features/Screenshare/Video'
import { Label } from 'components/UserView'
// import { useSelector, useDispatch } from 'state'

interface Props {
  sessionId: string
  label: string
  labelColor: string
}

export function Screen(props: Props) {
  return (
    <Container>
      <ScreenshareVideo sessionId={props.sessionId} />
      <Label css={{ backgroundColor: props.labelColor }}>{props.label}</Label>
    </Container>
  )
}

const Container = styled('div', {
  width: 'var(--tile-box-width)',
  height: 'var(--tile-box-height)',
  maxWidth: '100%',
  maxHeight: '100%',
  position: 'relative',
  center: true,
  aspectRatio: '1',
  zIndex: '$base',
  video: {
    round: 'large',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '$base',
    objectFit: 'contain',
    background: '$gray1',
  },
  [`& ${Label}`]: {
    maxWidth: '90%',
  },
})
