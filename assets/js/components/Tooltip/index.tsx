import { styled } from 'themes'
import React from 'react'
import { Root, Trigger, Portal, Content } from '@radix-ui/react-tooltip'
import { Kbd } from 'components/Kbd'
// import { useSelector, useDispatch } from 'state'

interface Props {
  children: React.ReactNode
  content: string
  shortcut?: string[]
}

export function Tooltip(props: Props): JSX.Element {
  return (
    <Root delayDuration={400}>
      <Trigger asChild>{props.children}</Trigger>
      <Portal>
        <StyledContent sideOffset={10} hideWhenDetached={true}>
          {props.content}
          {props.shortcut ? <Kbd keys={props.shortcut} /> : null}
        </StyledContent>
      </Portal>
    </Root>
  )
}

const StyledContent = styled(Content, {
  colors: {
    bg: '$tooltipBg',
    fg: '$tooltipFg',
  },
  display: 'flex',
  vcenter: true,
  border: '0.5px solid $tooltipBorder',
  round: 'medium',
  padding: '$space3 7px',
  fontSize: '$small',
  fontWeight: '$medium',
  gap: '$space4',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  backdrop: { blur: 10, saturate: 190, contrast: 70, brightness: 80 },
  cursor: 'default',
  zIndex: '$aboveOverlay',
})
