import { styled } from 'themes'
import React from 'react'
import {
  Root,
  Trigger,
  Portal,
  Content,
  Item,
  ItemIndicator,
  Label,
  Separator,
} from '@radix-ui/react-dropdown-menu'
import { Kbd, Key, Keys } from 'components/Kbd'
import Icon from 'components/Icon'
import { Switch } from 'components/Switch'
import { Root as SwitchRoot } from '@radix-ui/react-switch'

interface Props {
  children: React.ReactNode
}

export function DropdownMenu(props: Props) {
  return <Root>{props.children}</Root>
}

interface ContentProps {
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function DropdownContent(props: ContentProps) {
  return (
    <Portal>
      <StyledContent side={props.side || 'top'} sideOffset={5}>
        {props.children}
      </StyledContent>
    </Portal>
  )
}

interface ItemProps {
  label: string
  icon?: string
  kbd?: string[]
  onClick?: () => void
}

export function DropdownItem(props: ItemProps) {
  return (
    <StyledItem onClick={props.onClick}>
      {props.icon ? (
        <StyledIndicator>
          <Icon name={props.icon} />
        </StyledIndicator>
      ) : null}
      <ItemLabel>{props.label}</ItemLabel>
      {props.kbd ? <Kbd keys={props.kbd} sep /> : null}
    </StyledItem>
  )
}

interface TriggerProps {
  children: React.ReactNode
}

export function DropdownTrigger(props: TriggerProps) {
  return (
    <Trigger asChild>
      <div>{props.children}</div>
    </Trigger>
  )
}

interface SwitchProps {
  id: string
  label: string
  checked: boolean
  icon?: string
  onCheckedChange: (c: boolean) => void
}

export function SwitchItem(props: SwitchProps) {
  return (
    <StyledSwitchItem>
      {props.icon ? (
        <StyledIndicator>
          <Icon name={props.icon} />
        </StyledIndicator>
      ) : null}
      <Switch
        id={props.id}
        label={props.label}
        checked={props.checked}
        onCheckedChange={props.onCheckedChange}
      />
    </StyledSwitchItem>
  )
}

const ItemLabel = styled('div', {
  display: 'inline',
  ellipsis: true,
  width: '100%',
})

const StyledItemCSS = {
  display: 'flex',
  width: '100%',
  vcenter: true,
  height: '32px',
  padding: '0 $space4 0 28px',
  outline: 'none',
  cursor: 'default',
  round: 'medium',
  '&[data-highlighted]': {
    background: '$dropdownItemHighlightedBg',
  },
  [`& ${Keys}`]: {
    color: '$dropdownKbdFg',
    gap: '0',
  },
  [`& ${Key}`]: {
    background: '$dropdownKbdBg',
    color: '$dropdownKbdFg',
    width: 'auto',
    padding: '0 1px',
  },
  [`& ${SwitchRoot}`]: {
    marginLeft: 'auto',
  },
}

const StyledItem = styled(Item, StyledItemCSS)
const StyledSwitchItem = styled('div', StyledItemCSS)

const StyledContent = styled(Content, {
  colors: {
    bg: '$dropdownBg',
    fg: '$dropdownFg',
  },
  display: 'flex',
  flexDirection: 'column',
  padding: '$space3 $space3',
  fontSize: '$small',
  lineHeight: '$base',
  round: 'medium',
  width: '220px',
  fontWeight: '$medium',
  boxShadow: 'rgb(0 0 0 / 20%) 0px 4px 24px',
  border: '0.5px solid $dropdownBorder',
  backdrop: { blur: 10, saturate: 190, contrast: 70, brightness: 80 },
  'transform-origin': 'var(--radix-dropdown-menu-content-transform-origin)',
  animation: 'scaleIn 100ms ease-out',
  "&[data-side='top']": {
    'animation-name': 'slideUp',
  },
  "&[data-side='bottom']": {
    'animation-name': 'slideDown',
  },
})

const StyledIndicator = styled('div', {
  display: 'inline-flex',
  height: '20px',
  width: '20px',
  center: true,
  position: 'absolute',
  left: '10px',
  '& svg': {
    height: '12px',
  },
})

const StyledLabel = styled(Label, {
  vcenter: true,
  color: '$dropdownLabelFg',
  height: '32px',
  padding: '0 0 0 28px',
  label: true,
})

const StyledSeparator = styled(Separator, {
  width: 'calc(100% + 12px)',
  height: '0.5px',
  background: 'rgba(255, 255, 255, 0.075)',
  margin: '6px 0',
  marginLeft: '-6px',
})

export const Dropdown = {
  Menu: DropdownMenu,
  Content: DropdownContent,
  Trigger: DropdownTrigger,
  Item: DropdownItem,
  Label: StyledLabel,
  Separator: StyledSeparator,
  Switch: SwitchItem,
}
