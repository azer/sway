import React from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { styled } from 'themes'

const Trigger = styled(RadixSelect.Trigger, {
  display: 'flex',
  width: '100%',
  justifyContent: 'start',
  alignItems: 'center',
  height: '36px',
  padding: '0 12px',
  position: 'relative',
  color: '$gray1',
  boxShadow: 'rgba(0, 0, 0, 0.075) 0px 2px 4px',
  outline: 'none',
  '& span': {
    flexGrow: '1',
    textAlign: 'left',
    maxWidth: 'calc(100% - 18px)',
    ellipsis: true,
  },
  '& svg': {
    width: '18px',
    height: '18px',
    color: '$gray3',
  },
  '&:hover': {
    background: 'rgba(253, 252, 251, 1)',
    color: '$black',
  },
  border: '0',
  background: '$white',
  fontFamily: '$sans',
  round: 'medium',
  ellipsis: true,
  '&[data-state="open"]': {
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '0',
  },
})

const Content = styled(RadixSelect.Content, {
  width: 'var(--radix-select-trigger-width)',
  background: '$white',
  round: 'medium',
  borderTopLeftRadius: '0',
  borderTopRightRadius: '0',
  overflow: 'hidden',
  boxShadow: 'rgba(0, 0, 0, 0.075) 0px 2px 4px',
})

const Item = styled(RadixSelect.Item, {
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  outline: 'none',
  padding: '0 12px',
  fontSize: '$base',
  fontFamily: '$sans',
  cursor: 'default',
  color: '$gray1',
  ellipsis: true,
  '&:hover': {
    color: '$black',
  },
  '&[data-highlighted]': {
    background: 'rgba(243, 242, 241)',
    color: '$black',
  },
})

const Label = styled(RadixSelect.Label, {
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  color: '$gray8',
  fontSize: '$small',
  padding: '0 12px',
})

export const Select = {
  Root: RadixSelect.Root,
  Trigger: Trigger,
  Value: RadixSelect.Value,
  Icon: RadixSelect.Icon,
  Portal: RadixSelect.Portal,
  Item: Item,
  ItemText: RadixSelect.ItemText,
  Content: Content,
  Viewport: RadixSelect.Viewport,
  Group: RadixSelect.Group,
  Label: Label,
}
