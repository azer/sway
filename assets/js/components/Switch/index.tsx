import { styled } from 'themes'
import React from 'react'
import { Root, Thumb } from '@radix-ui/react-switch'

interface Props {
  id?: string
  label: string
  checked: boolean
  onCheckedChange: (c: boolean) => void
}

export function Switch(props: Props) {
  return (
    <StyledSwitch>
      <Label htmlFor={props.id}>{props.label}</Label>
      <StyledRoot
        defaultChecked={props.checked}
        id={props.id}
        onCheckedChange={(checked) => {
          props.onCheckedChange(checked)
        }}
      >
        <StyledThumb />
      </StyledRoot>
    </StyledSwitch>
  )
}

export const StyledSwitch = styled('div', {
  display: 'flex',
  vcenter: true,
  width: '100%',
})

const StyledRoot = styled(Root, {
  background: '$switchBg',
  width: '24px',
  height: '14px',
  border: 0,
  borderRadius: '9999px',
  position: 'relative',
  marginLeft: 'auto',
  padding: 0,
  '&:focus': {
    boxShadow: '0 0 5px 2px rgba(0,0,0,0.15)',
  },
  '&:hover': {
    boxShadow: '0 2px 2px rgba(0,0,0,0.15)',
  },
  '&[data-state="checked"]': {
    backgroundColor: '$switchCheckedBg',
  },
})

const StyledThumb = styled(Thumb, {
  display: 'block',
  width: '10px',
  height: '10px',
  background: '$switchFg',
  round: true,
  boxShadow: '0 2px 2px rgba(0,0,0,0.25)',
  transition: 'transform 100ms',
  transform: 'translateX(3px)',
  willChange: 'transform',
  '&[data-state="checked"]': {
    background: '$switchCheckedFg',
    transform: 'translateX(11px)',
  },
})

const Label = styled('label', {})
