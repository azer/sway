import { styled } from 'themes'
import React, { useState } from 'react'
import { StyledSwitch, StyledRoot, StyledThumb } from 'components/Switch'
import Icon from 'components/Icon'
import { StyledButton } from 'features/Dock/Button'
import { Tooltip } from 'components/Tooltip'

interface Props {
  isActive: boolean
  joinCall: () => void
  leaveCall: () => void
}

export function CallSwitch(props: Props) {
  return (
    <Tooltip
      content={props.isActive ? 'Leave call' : 'Join call'}
      shortcut={['Space']}
    >
      <Button
        onClick={() => handleClick()}
        on={props.isActive}
        off={!props.isActive}
      >
        <StyledSwitch>
          <Icon name="headphones" />
          <CustomStyledRoot
            checked={props.isActive}
            onCheckedChange={handleClick}
          >
            <CustomStyledThumb />
          </CustomStyledRoot>
        </StyledSwitch>
      </Button>
    </Tooltip>
  )

  function handleClick(on: boolean | undefined) {
    const action = on !== undefined ? on : !props.isActive

    if (action) {
      props.joinCall()
    } else {
      props.leaveCall()
    }
  }
}

const CustomStyledRoot = styled(StyledRoot, {
  width: '44px',
  height: '24px',
  borderRadius: '9999px',
  position: 'relative',
  marginLeft: 'auto',
  padding: 0,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(20, 24, 31, 0.5)',
  '&:focus': {
    boxShadow: '0 0 5px 2px rgba(0,0,0,0.15)',
  },
  '&:hover': {
    boxShadow: '0 2px 2px rgba(0,0,0,0.15)',
  },
  '&[data-state="checked"]': {
    background: 'rgb(8, 110, 215)',
  },
})

const CustomStyledThumb = styled(StyledThumb, {
  width: '14px',
  height: '14px',
  transform: 'translateX(4px)',
  willChange: 'transform',
  '&[data-state="checked"]': {
    transform: 'translateX(24px)',
  },
})

const shadow = 'rgba(0,0,0, 0.05)'

const Button = styled(StyledButton, {
  display: 'flex',
  position: 'relative',
  aspectRatio: 'inherit',
  alignItems: 'center',
  height: '48px',
  width: '100px !important',
  borderRadius: '8px',
  gap: '8px',
  svg: {
    height: '20px',
    width: '20px',
  },
  '&::after': {
    content: ' ',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    borderRadius: '0.5rem',
    boxShadow:
      '0 0 #0000, 0 0 #0000, inset 0px 0px 0px 1px rgb(255 255 255 / 0.05)',
  },
})
