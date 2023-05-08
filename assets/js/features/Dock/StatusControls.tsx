import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import Icon from 'components/Icon'
import { firstName, titleCase } from 'lib/string'
import { ToggleGroup } from 'components/ToggleGroup'
import { PresenceModes, PresenceStatus } from 'state/presence'
import { DockFocus, DockFocusRegion } from './focus'
import { EmojiObject } from 'features/Emoji/use-emoji-search'
import { Status, User } from 'state/entities'
import { FocusRegion } from 'components/FocusRegion'
import { Tooltip } from 'components/Tooltip'
import { logger } from 'lib/log'
import * as Popover from '@radix-ui/react-popover'
import { useHotkeys } from 'react-hotkeys-hook'
import { StatusCircle, StatusIcon } from './StatusIcon'
import { FocusItem } from 'components/FocusItem/FocusItem'

interface Props {
  localStatus?: Status
  localUser?: User
  message: string
  setMessage: (m: string) => void
  saveMessage: () => void
  resetMessage: () => void
  emojiQuery: string
  setEmojiQuery: (q: string) => void
  selectEmoji: (emoji: string | undefined) => void
  emojiResults: EmojiObject[]
  focus?: DockFocus
  setFocusRegion: (r: DockFocusRegion) => void
  setFocusedEmojiId: (id: string | undefined) => void
  handleBlur: (e: Event) => void
  setPresence: (p: PresenceStatus) => void
  isDropdownOpen: boolean
  setDropdownOpen: (o: boolean) => void
  setFocusAway: () => void
  reverseOrder?: boolean
  tray?: boolean
}

const log = logger('dock/status-controls')

export function StatusControls(props: Props) {
  const messageInputRef = useRef<HTMLInputElement | null>(null)
  const emojiInputRef = useRef<HTMLInputElement | null>(null)
  const triggerRef = useRef<HTMLDivElement | null>(null)
  const statusItemRef = useRef<HTMLElement | null>(null)
  const focusedEmojiId =
    props.focus?.region === DockFocusRegion.EmojiSearch
      ? props.focus?.emoji?.id
      : undefined

  useEffect(() => {
    if (!props.focus) {
      messageInputRef.current?.blur()
      return
    }

    log.info('focus region changed', props.focus?.region)

    switch (props.focus.region) {
      case DockFocusRegion.Message:
        setTimeout(() => {
          messageInputRef.current?.focus()
        }, 100)
        break
      case DockFocusRegion.EmojiSearch:
        emojiInputRef.current?.focus()
        if (!props.isDropdownOpen) {
          props.setDropdownOpen(true)
        }
        break
      case DockFocusRegion.Status:
        statusItemRef.current?.focus()

        if (!props.isDropdownOpen) {
          props.setDropdownOpen(true)
        }
        break
      case DockFocusRegion.CallControls:
        break
    }
  }, [props.focus])

  useEffect(() => {
    log.info('focus region / dropdown status changed', props.focus?.region)

    if (
      props.focus?.region === DockFocusRegion.Message &&
      props.isDropdownOpen
    ) {
      messageInputRef.current?.focus()
    }
  }, [props.focus?.region, props.isDropdownOpen])

  useEffect(() => {
    if (!props.isDropdownOpen) return

    if (
      props.focus?.region === DockFocusRegion.EmojiSearch &&
      props.emojiResults.length > 0
    ) {
      log.info('Focus on first emoji')
      props.setFocusedEmojiId(props.emojiResults[0].id)
    } else if (props.emojiResults.length === 0) {
      log.info('Clean up emoji focus')
      props.setFocusedEmojiId(undefined)
    }
  }, [props.isDropdownOpen, props.emojiResults])

  useHotkeys(
    'left',
    moveEmoji(-1),
    {
      enabled: props.focus?.region === DockFocusRegion.EmojiSearch,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [props.focus]
  )

  useHotkeys(
    'right',
    moveEmoji(1),
    {
      enabled: props.focus?.region === DockFocusRegion.EmojiSearch,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [props.focus]
  )

  useHotkeys(
    'enter',
    () => props.selectEmoji(focusedEmojiId),
    {
      enabled: props.focus?.region === DockFocusRegion.EmojiSearch,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [props.focus]
  )

  useHotkeys(
    'enter',
    () => props.saveMessage(),
    {
      enabled: props.focus?.region === DockFocusRegion.Message,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [props.focus, props.message]
  )

  useHotkeys(
    'esc',
    () => props.resetMessage(),
    {
      enabled: props.focus?.region === DockFocusRegion.Message,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [props.focus]
  )

  useHotkeys(
    'esc',
    () => {
      if (props.isDropdownOpen) {
        props.setDropdownOpen(false)
      } else {
        props.setFocusAway()
      }
    },
    {
      enabled: !!focus,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [props.isDropdownOpen]
  )

  return (
    <StatusControlsRoot>
      <Popover.Root
        open={props.isDropdownOpen}
        onOpenChange={props.setDropdownOpen}
      >
        <FocusRegion
          regionId={DockFocusRegion.Message}
          focusSwitcher={props.setFocusRegion}
          regionRef={triggerRef}
          onClick={() => {
            if (
              props.tray &&
              props.focus?.region === DockFocusRegion.Message &&
              !props.isDropdownOpen
            ) {
              props.setDropdownOpen(true)
            }
          }}
        >
          <StyledAnchor reverse={props.reverseOrder} />
          <MessageSection
            tray={props.tray}
            focused={
              props.tray && props.focus?.region === DockFocusRegion.Message
            }
          >
            <Tooltip content="Set emoji & flow">
              <Popover.Trigger asChild>
                <CurrentStatusIcon>
                  {props.localStatus?.emoji ? (
                    <StatusIcon status={props.localStatus} />
                  ) : (
                    <Icon name="emoji" />
                  )}
                </CurrentStatusIcon>
              </Popover.Trigger>
            </Tooltip>
            <MessageInput
              type="text"
              ref={messageInputRef}
              placeholder={`What's cookin, ${firstName(
                props.localUser?.name || ''
              )}?`}
              value={props.message}
              onChange={(e) => props.setMessage(e.currentTarget.value)}
            />
          </MessageSection>
        </FocusRegion>

        <Popover.Portal>
          <Popover.Content
            onFocusOutside={handleFocusOutside}
            onPointerDownOutside={handlePointerDownOutside}
            side={props.reverseOrder ? 'top' : 'bottom'}
            asChild
          >
            <ControlMenu tray={props.tray} reverse={props.reverseOrder}>
              <FocusRegion
                regionId={DockFocusRegion.EmojiSearch}
                focusSwitcher={props.setFocusRegion}
              >
                <DockSection
                  focused={props.focus?.region === DockFocusRegion.EmojiSearch}
                  nolabel
                >
                  <SearchField>
                    <Icon name="search" />
                    <EmojiSearchInput
                      value={props.emojiQuery}
                      onChange={(e) =>
                        props.setEmojiQuery(e.currentTarget.value)
                      }
                      placeholder="Search"
                      ref={emojiInputRef}
                    />
                  </SearchField>
                  <EmojiPicker>
                    {props.emojiResults.length === 0 ? (
                      <NoEmoji>No emojis found</NoEmoji>
                    ) : (
                      props.emojiResults.slice(0, 10).map((e, ind) => (
                        <Emoji
                          role="img"
                          aria-label={e.id}
                          highlighted={e.id === focusedEmojiId}
                          onMouseOver={() => props.setFocusedEmojiId(e.id)}
                          onClick={() => props.selectEmoji(e.id)}
                        >
                          {e.skins[0].native}
                        </Emoji>
                      ))
                    )}
                  </EmojiPicker>
                </DockSection>
              </FocusRegion>
              <FocusRegion
                regionId={DockFocusRegion.Status}
                focusSwitcher={props.setFocusRegion}
              >
                <DockSection
                  focused={props.focus?.region === DockFocusRegion.Status}
                >
                  <Label
                    focused={props.focus?.region === DockFocusRegion.Status}
                  >
                    Set your flow
                  </Label>
                  <ToggleGroup.Root
                    value={props.localPresence}
                    onValueChange={(presence: PresenceStatus) =>
                      props.setPresence(presence)
                    }
                    rovingFocus={props.focus?.region === DockFocusRegion.Status}
                  >
                    {PresenceModes.map((m) => (
                      <ToggleGroup.Item
                        data-mode={m.status}
                        value={m.status}
                        key={m.status}
                        itemRef={
                          m.status === PresenceStatus.Online
                            ? statusItemRef
                            : undefined
                        }
                      >
                        <ModeIcon presence={m.status} />
                        <ToggleGroup.Label>
                          {titleCase(m.status)}
                        </ToggleGroup.Label>
                      </ToggleGroup.Item>
                    ))}
                  </ToggleGroup.Root>
                </DockSection>
              </FocusRegion>
            </ControlMenu>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </StatusControlsRoot>
  )

  function handleFocusOutside(event: Event) {
    if (triggerRef.current?.contains(event.target as Element)) {
      event.preventDefault()
    } else {
      props.handleBlur(event)
    }
  }

  function handlePointerDownOutside(event: Event) {
    if (triggerRef.current?.contains(event.target as Element)) {
      event.preventDefault()
    }
  }

  function moveEmoji(add: number) {
    return () => {
      const ind = props.emojiResults.findIndex(
        (e) => e.id === props.focus?.emoji?.id
      )

      const nextInd = (ind + add) % props.emojiResults.length
      const next =
        props.emojiResults[
          nextInd < 0 ? props.emojiResults.length - 1 : nextInd
        ]

      props.setFocusedEmojiId(next.id)
    }
  }
}

export const DockSection = styled(FocusItem, {
  width: '100%',
  height: '100%',
  padding: '8px 8px 8px 12px',
  variants: {
    focused: {
      true: {
        background: '$dockFocusSectionBg',
      },
    },
    nolabel: {
      true: {
        paddingTop: '16px',
      },
    },
  },
})

export const StatusControlsRoot = styled('div', {
  vcenter: true,
  width: '100%',
  [`& ${DockSection}`]: {
    padding: '8px 8px 8px 5.5px',
    borderTop: '1px solid rgba(255, 255, 255, 0.025)',
  },
})

export const MessageSection = styled(DockSection, {
  display: 'flex',
  alignItems: 'center',
  padding: '0 0 0 0 !important',
  borderTop: '0 !important',
  gap: '6px',
  variants: {
    tray: {
      true: {
        padding: '4px 12px !important',
      },
    },
  },
})

const StyledAnchor = styled(Popover.Anchor, {
  position: 'absolute',
  left: '50%',
  bottom: '0',
  zIndex: '99999',
  width: '0',
  height: '0',
  variants: {
    reverse: {
      true: {
        top: '0',
      },
    },
  },
})

const ControlMenu = styled('div', {
  zIndex: '$modal',
  padding: '0',
  width: '300px',
  overflow: 'hidden',
  backdropFilter: 'blur(20px) saturate(190%) contrast(70%) brightness(45%)',
  border: '1px solid $dockBorderColor',
  borderTop: '0',
  borderRadius: '0',
  borderBottomLeftRadius: '$medium',
  borderBottomRightRadius: '$medium',
  boxShadow: 'rgb(0 0 0 / 10%) 0px -10px 8px',
  display: 'flex',
  flexDirection: 'column',
  [`& ${ToggleGroup.StyledRoot}`]: {
    width: '100%',
    margin: '2px 0 8px 0',
    fontFamily: '$sans',
    fontSize: '$base',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [`& ${ToggleGroup.StyledItem}`]: {
    fontFamily: '$sans',
    fontSize: '$base',
    center: true,
    flexDirection: 'row',
  },
  [`& ${DockSection}`]: {
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
  },
  variants: {
    tray: {
      true: {
        width: 'calc(100vw - 30px)',
        margin: '0 auto',
        flexDirection: 'column-reverse',
        background: '$electronTrayDockBg',
      },
    },
    reverse: {
      true: {
        borderBottom: '0',
        borderRadius: '0',
        borderTopLeftRadius: '$medium',
        borderTopRightRadius: '$medium',
      },
    },
  },
})

const CurrentStatusIcon = styled('label', {
  display: 'flex',
  width: '21px',
  '& svg': {
    aspectRatio: '1',
    height: '21px',
    color: 'rgba(255, 255, 255, 0.3)',
  },
})

const EmojiPicker = styled('div', {
  display: 'flex',
  vcenter: true,
  height: '28px',
  overflow: 'hidden',
  margin: '12px 2px 6px 2px',
})

const Emoji = styled('span', {
  display: 'inline-flex',
  aspectRatio: '1',
  height: '100%',
  center: true,
  fontSize: '21px',
  label: true,
  round: 'small',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  variants: {
    highlighted: {
      true: {
        background: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
})

const NoEmoji = styled('div', {
  textAlign: 'center',
  paddingLeft: '8px',
  color: '$gray9',
})

const MessageInput = styled('input', {
  display: 'block',
  border: 0,
  width: '100%',
  height: '100%',
  background: 'transparent',
  outline: 'none',
  font: '$sans',
  fontSize: '$base',
  color: '$electronTrayTextFieldFg',
  fontWeight: '$medium',
  caretColor: '$electronTrayTextFieldCaret',
  '&:focus': {
    color: '$electronTrayTextFieldFocusFg',
  },
  '&::selection': {
    background: '$electronTrayTextFieldSelectionBg',
  },
  '&::placeholder': {
    color: '$electronTrayTextFieldPlaceholder',
  },
})

const ModeIcon = styled(StatusCircle, {
  width: '8px',
  aspectRatio: '1',
  marginTop: '2px',
})

const SearchField = styled('div', {
  position: 'relative',
  height: '32px',
  vcenter: true,
  background: 'rgba(115, 120, 125, 0.2)',
  borderRadius: '$medium',
  [`& svg`]: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    left: '8px',
  },
})

const Label = styled('div', {
  vcenter: true,
  display: 'flex',
  fontSize: '$small',
  fontWeight: '$medium',
  color: 'rgba(255, 255, 255, 0.4)',
  height: '28px',
  marginBottom: '8px',
  label: true,
  variants: {
    focused: {
      true: {
        color: 'rgba(255, 255, 255, 0.6)',
      },
    },
  },
})

const EmojiSearchInput = styled('input', {
  display: 'block',
  width: '100%',
  border: '0',
  background: 'transparent',
  height: '100%',
  padding: '0 0 0 28px',
  color: '$electronTrayTextFieldFg',
  fontWeight: '$medium',
  caretColor: '$electronTrayTextFieldCaret',
  outline: 'none',
  fontSize: '$base',
  fontFamily: '$sans',
  '&::selection': {
    background: '$electronTrayTextFieldSelectionBg',
  },
  '&::placeholder': {
    color: '$electronTrayTextFieldPlaceholder',
  },
})
