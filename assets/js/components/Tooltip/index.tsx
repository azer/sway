import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { Root, Trigger, Portal, Content } from '@radix-ui/react-tooltip'
import { keySymbol } from 'lib/shortcuts'
// import { useSelector, useDispatch } from 'state'

interface Props {
  children: React.ReactNode
  content: string
  shortcut?: string[]
}

export function Tooltip(props: Props) {
  if (!props.content) {
    return props.children
  }

  return (
    <Root delayDuration={400}>
      <Trigger asChild>{props.children}</Trigger>
      <Portal>
        <StyledContent sideOffset={10}>
          {props.content}
          {props.shortcut ? (
            <Shortcut>
              {props.shortcut?.map((s) => (
                <Kbd key={s}>{keySymbol(s)}</Kbd>
              ))}
            </Shortcut>
          ) : null}
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
  fontWeight: '$semibold',
  gap: '$space4',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  backdropFilter: { blur: 10, saturate: 190, contrast: 70, brightness: 80 },
  cursor: 'default',
})

const Shortcut = styled('div', {
  display: 'flex',
  gap: '$space1',
})

export const Kbd = styled('div', {
  background: '$tooltipKeyBg',
  color: '$tooltipKeyFg',
  round: 'small',
  textTransform: 'uppercase',
  width: '20px',
  height: '20px',
  center: true,
})
