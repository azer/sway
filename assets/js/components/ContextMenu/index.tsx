import {
  Root,
  Trigger,
  Portal,
  Content,
  Label,
  Item,
  Separator,
  ItemIndicator,
} from '@radix-ui/react-context-menu'

import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import Icon from 'components/Icon'
import { Kbd } from 'components/Kbd'
import { Emoji } from 'components/Emoji'
// import { useSelector, useDispatch } from 'state'

interface Props {
  children: React.ReactNode
}

export function LocalContent(props: Props) {
  return (
    <Portal>
      <StyledContent>{props.children}</StyledContent>
    </Portal>
  )
}

const StyledContent = styled(Content, {
  minWidth: '220px',
  fontSize: '13px',
  fontFamily: '$sans',
  background: '$contextMenuBg',
  color: '$contextMenuFg',
  boxShadow: 'rgb(0 0 0 / 50%) 0px 16px 70px',
  border: '0.5px solid rgba(82, 82, 111, 0.44)',
  backdropFilter: 'blur(20px) saturate(190%) contrast(70%) brightness(80%)',
  padding: '4px',
  round: 'medium',
})

interface ItemProps {
  icon?: string
  emoji?: string
  label: string
  kbd?: string[]
  onClick?: () => void
}

export function LocalItem(props: ItemProps) {
  return (
    <StyledItem onClick={props.onClick}>
      <LeftSlot>
        {props.icon ? <Icon name={props.icon} /> : null}
        {props.emoji ? <Emoji id={props.emoji} /> : null}
      </LeftSlot>
      {props.label}
      <RightSlot>{props.kbd ? <Kbd keys={props.kbd} /> : null}</RightSlot>
    </StyledItem>
  )
}

const RightSlot = styled('div', {
  color: '$contextMenuRightSlotFg',
})

const LeftSlot = styled('div', {
  color: '$contextMenuLeftSlotFg',
  center: true,
  opacity: '0.9',
  '& svg': {
    display: 'block',
    height: '14px',
  },
  '& em-emoji': {
    fontSize: '16px',
  },
})

const StyledItem = styled(Item, {
  vcenter: true,
  display: 'grid',
  gridTemplateColumns: '36px auto 50px',
  height: '32px',
  fontWeight: '$medium',
  label: true,
  outline: 'none',
  round: 'small',
  '&[data-highlighted]': {
    background: '$contextMenuHighlightBg',
    color: '$contextMenuHighlightFg',
    [`& ${LeftSlot}`]: {
      opacity: '1',
      color: '$candy',
    },
  },
})

const StyledSeparator = styled(Separator, {
  margin: '8px 0',
  height: '1px',
  background: 'rgba(255, 255, 255, 0.07)',
})

export const ContextMenu = {
  Root: Root,
  Portal: Portal,
  Content: LocalContent,
  Trigger: Trigger,
  Item: LocalItem,
  Label: Label,
  Separator: StyledSeparator,
  Switch: Item,
}
