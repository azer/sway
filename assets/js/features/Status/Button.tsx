import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import Icon from 'components/Icon'
// import { useSelector, useDispatch } from 'state'

interface Props {
  icon: string
  label: string
}

export default function Button(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return (
    <Container>
      <Icon name={props.icon} />
      <Label>{props.label}</Label>
    </Container>
  )
}

export const Container = styled('div', {
  center: true,
  minWidth: '64px',
  round: 'large',
  space: { inner: [0, 2], gap: 1 },
  colors: {
    bg: '$statusTrayButtonBg',
    fg: '$statusTrayButtonFg',
  },
  '& svg': {
    color: '$statusTrayButtonIconFg',
    round: 'circle',
    width: '24px',
    height: '24px',
    margin: '0 auto',
    overflow: 'visible',
  },
  variants: {
    highlighted: {
      true: {},
    },
  },
  '&:hover': {
    background: '$statusTrayButtonHoverBg',
    color: '$statusTrayButtonHoverFg',
  },
})

export const Label = styled('label', {
  vcenter: true,
  fontSize: '$small',
  fontWeight: '$medium',
  label: true,
})
