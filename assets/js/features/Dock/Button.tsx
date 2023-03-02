import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import Icon from 'components/Icon'
import { Tooltip } from 'components/Tooltip'
// import { useSelector, useDispatch } from 'state'

interface Props {
  icon: string
  label: string
  onClick?: () => void
  off?: boolean
  on?: boolean
  tooltipLabel?: string
  tooltipShortcut?: string[]
}

export function Button(props: Props) {
  return (
    <StyledButton onClick={props.onClick} off={props.off} on={props.on}>
      <Tooltip content={props.tooltipLabel} shortcut={props.tooltipShortcut}>
        <Icon name={props.icon} />
      </Tooltip>
    </StyledButton>
  )
}

export const StyledButton = styled('button', {
  border: 0,
  background: 'transparent',
  height: '36px',
  aspectRatio: '1',
  center: true,
  borderRadius: '8px',
  space: { inner: [0, 2], gap: 1 },
  //  border: '1px solid rgba(255, 255, 255, 0.01)',
  colors: {
    //    bg: '$dockButtonBg',
    fg: '$dockButtonFg',
  },
  '& svg': {
    width: '18px',
    height: '18px',
    margin: '0 auto',
    overflow: 'visible',
  },
  '&:hover': {
    background: '$dockButtonHoverBg',
    color: '$dockButtonHoverFg',
    borderColor: 'rgba(255, 255, 255, 0.03),',
  },
  '&[data-state=open]': {
    background: '$dockButtonHoverBg',
    color: '$dockButtonHoverFg',
    borderColor: 'rgba(255, 255, 255, 0.03),',
  },
  variants: {
    off: {
      true: {
        color: '$dockButtonOffFg',
      },
    },
    on: {
      true: {
        color: '$dockButtonOnFg',
      },
    },
  },
})

const Wrapper = styled('div', {
  width: '100%',
  height: '100%',
  center: true,
})
