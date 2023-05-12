import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import Icon from 'components/Icon'
// import { useSelector, useDispatch } from 'state'

interface Props {
  label: string
  enabled: boolean
  onClick: () => void
}

export function Device(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return (
    <StyledDevice enabled={props.enabled} onClick={props.onClick}>
      <Icon name={props.enabled ? 'checkmark' : 'close'} /> {props.label}
      <Hint>{props.enabled ? 'Enabled' : 'Blocked'}</Hint>
    </StyledDevice>
  )
}

const StyledDevice = styled('div', {
  display: 'flex',
  fontSize: '16px',
  fontWeight: '$normal',
  alignItems: 'center',
  gap: '12px',
  border: '1px solid rgba(225, 0, 0, 0.2)',
  padding: '12px 12px',
  borderRadius: '$large',
  position: 'relative',
  label: true,
  '& svg': {
    width: '24px',
    height: '24px',
    round: true,
    background: 'rgba(225, 0, 0, 0.2)',
    color: 'rgba(225, 0, 0, 1)',
    border: '1px solid rgba(225, 0, 0, 0.1)',
    padding: '6px',
  },
  variants: {
    enabled: {
      true: {
        borderColor: 'rgba(0,175,0,0.4)',
        '& svg': {
          background: 'rgba(0, 155, 0, 0.2)',
          borderColor: 'rgba(0, 155, 0, 0.1)',
          color: '$green',
          padding: '2px',
        },
      },
    },
  },
  '&:hover': {
    background: 'rgba(205, 205, 205, 0.15)',
    color: '$black',
  },
})

const Hint = styled('span', {
  position: 'absolute',
  textAlign: 'right',
  fontSize: '$small',
  color: 'rgba(120, 124, 131, 1)',
  right: '20px',
})
