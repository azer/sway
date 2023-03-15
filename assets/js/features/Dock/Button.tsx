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
    <Tooltip
      content={props.tooltipLabel || ''}
      shortcut={props.tooltipShortcut}
    >
      <Container onClick={props.onClick}>
        <StyledButton onClick={props.onClick} off={props.off} on={props.on}>
          <Icon name={props.icon} />
        </StyledButton>
      </Container>
    </Tooltip>
  )
}

const shadow = 'rgba(0,0,0, 0.05)'

export const StyledButton = styled('button', {
  outline: '2px solid transparent',
  boxShadow: `0px 1px 0px -1px ${shadow}, 0px 1px 1px -1px ${shadow}, 0px 1px 2px -1px ${shadow}, 0px 2px 4px -2px ${shadow}, 0px 3px 6px -3px ${shadow}`,
  border: '1px solid rgba(20, 22, 26, 0.7)',
  height: '100%',
  aspectRatio: '1',
  center: true,
  borderRadius: '8px',
  padding: '12px',
  colors: {
    bg: 'rgba(49, 49, 49, 0.7)',
    fg: '$dockButtonFg',
  },
  '& svg': {
    aspectRatio: '1',
    height: '20px',
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

const Container = styled('div', {
  position: 'relative',
  '&::after': {
    content: ' ',
    position: 'absolute',
    width: 'calc(100% - 2px)',
    height: 'calc(100% - 2px)',
    top: '1px',
    left: '1px',
    borderRadius: '0.5rem',
    boxShadow:
      '0 0 #0000, 0 0 #0000, inset 0px 0px 0px 1px rgb(255 255 255 / 0.05)',
  },
})
