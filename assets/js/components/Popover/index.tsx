import React from 'react'
import { Root, Content, Portal } from '@radix-ui/react-popover'

interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PopoverRoot(props: PopoverProps) {
  return <Root {...props}>{props.children}</Root>
}

interface ContentProps {
  children: React.ReactNode
}

export function PopoverContent(props: ContentProps) {
  return (
    <Portal>
      <Content>{props.children}</Content>
    </Portal>
  )
}

interface TriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function PopoverTrigger(props: TriggerProps) {
  return <Root>{props.children}</Root>
}

export const Popover = {
  Root: PopoverRoot,
  Content: PopoverContent,
  Trigger: PopoverTrigger,
}
