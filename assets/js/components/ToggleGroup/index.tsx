import { styled } from 'themes'
import React from 'react'
import Icon from '../Icon'
import { Root, Item } from '@radix-ui/react-toggle-group'

// import { useSelector, useDispatch } from 'state'

interface RootProps {
  children: React.ReactNode
  value: string
}

function ToggleRoot(props: RootProps) {
  return (
    <StyledRoot type="single" defaultValue={props.value}>
      {props.children}
    </StyledRoot>
  )
}

interface ItemProps {
  icon?: string
  label?: string
  value: string
  children: React.ReactNode
}

function ToggleItem(props: ItemProps) {
  return (
    <StyledItem value={props.value}>
      {props.children ? props.children : null}
      {props.icon ? <Icon name={props.icon} /> : null}
      {props.label ? <Label>{props.label}</Label> : null}
    </StyledItem>
  )
}

const StyledItem = styled(Item, {
  display: 'flex',
  vcenter: true,
  border: 0,
  gap: '6px',
  padding: '0 8px',
  background: 'rgba(115, 120, 125, 0.2)',
  borderLeft: '1px solid rgba(115, 120, 125, 0.2)',
  color: 'rgba(255, 255, 255, 0.6)',
  flexGrow: '1',
  outline: 'none',
  "&[data-state='on']": {
    background: 'rgba(115, 120, 125, 0.4)',
    color: '$white',
  },
})

const StyledRoot = styled(Root, {
  display: 'inline-flex',
  height: '32px',
  borderRadius: '$medium',
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 5px',
  [`& ${StyledItem}:first-child`]: {
    borderTopLeftRadius: '$medium',
    borderBottomLeftRadius: '$medium',
    borderLeft: '0',
  },
  [`& ${StyledItem}:last-child`]: {
    borderTopRightRadius: '$medium',
    borderBottomRightRadius: '$medium',
  },
})

const Label = styled('label', {
  fontWeight: '$medium',
})

export const ToggleGroup = {
  StyledRoot: StyledRoot,
  StyledItem: StyledItem,
  Root: ToggleRoot,
  Item: ToggleItem,
  Label: Label,
}
