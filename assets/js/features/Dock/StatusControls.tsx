import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { Dropdown, StyledDropdownContent } from 'components/DropdownMenu'
import Icon from 'components/Icon'
import { firstName, titleCase } from 'lib/string'
import { useSelector, useDispatch } from 'state'
import { ToggleGroup } from 'components/ToggleGroup'
import { PresenceModes, PresenceStatus } from 'state/presence'
import { DockFocusRegion } from './focus'
import { EmojiObject } from 'features/Emoji/use-emoji-search'
import { User } from 'state/entities'
import { FocusRegion } from 'components/FocusRegion'
import { Tooltip } from 'components/Tooltip'

interface Props {
  localUser?: User
  message: string
  setMessage: (m: string) => void
  emojiQuery: string
  setEmojiQuery: (q: string) => void
  emojiResults: EmojiObject[]
  focusedEmojiId?: string
  focus?: DockFocus
  setFocusRegion: (r: DockFocusRegion) => void
  handleBlur: () => void
}

export function StatusControls(props: Props) {
  const messageInputRef = useRef<HTMLInputElement | null>(null)
  const isDropdownOpen =
    props.focus && props.focus.region !== DockFocusRegion.CallControls

  return (
    <Container>
      <Dropdown.Menu
        open={isDropdownOpen}
        onOpenChange={(o: boolean) => {
          console.log('dropdown open?', o)
          if (!o) {
            props.handleBlur()
          }
        }}
      >
        <FocusRegion name={DockFocusRegion.Message}>
          <Dropdown.Trigger>
            <Tooltip content="Set your flow">
              <CurrentStatusIcon>
                <Icon name="emoji" />
              </CurrentStatusIcon>
            </Tooltip>
          </Dropdown.Trigger>
          <MessageInput
            type="text"
            ref={messageInputRef}
            placeholder={`What's cookin, ${firstName(
              props.localUser?.name || ''
            )}?`}
            onFocus={() => props.setFocusRegion(DockFocusRegion.Message)}
            onChange={(e) => props.setMessage(e.currentTarget.value)}
          />
        </FocusRegion>

        <StatusDropdown>
          <FocusRegion name={DockFocusRegion.Status}>
            <Dropdown.Label>Set your flow</Dropdown.Label>
            <ToggleGroup.Root value={PresenceStatus.Online}>
              {PresenceModes.map((m) => (
                <ToggleGroup.Item
                  data-mode={m.status}
                  value={m.status}
                  key={m.status}
                >
                  <ModeIcon mode={m.status} />
                  <ToggleGroup.Label>{titleCase(m.status)}</ToggleGroup.Label>
                </ToggleGroup.Item>
              ))}
            </ToggleGroup.Root>
          </FocusRegion>
          <Separator />
          <FocusRegion name={DockFocusRegion.EmojiSearch}>
            <SearchField>
              <Icon name="search" />
              <EmojiSearchInput
                value={props.emojiQuery}
                onChange={(e) => props.setEmojiQuery(e.currentTarget.value)}
                placeholder="Emoji search"
                onFocus={() =>
                  props.setFocusRegion(DockFocusRegion.EmojiSearch)
                }
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
                    highlighted={e.id === props.focusedEmojiId}
                  >
                    {e.skins[0].native}
                  </Emoji>
                ))
              )}
            </EmojiPicker>
          </FocusRegion>
        </StatusDropdown>
      </Dropdown.Menu>
    </Container>
  )
}

const Container = styled('div', {
  vcenter: true,
  height: '44px',
  padding: '8px 12px',
  //height: '24px',
  [`& section[data-region="${DockFocusRegion.Message}"]`]: {
    display: 'flex',
    width: '100%',
    gap: '8px',
    height: '100%',
  },
})

const Dock = styled('div', {
  position: 'absolute',
  left: '15px',
  bottom: '15px',
  width: 'calc(100% - 30px)',
  height: '44px',
  padding: '0 12px',
  vcenter: true,
  background: '$electronTrayDockBg',
  borderRadius: '$medium',
  border: '1px solid transparent',
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
  '&:focus-within': {
    borderTop: '0',
    border: '1px solid rgba(255,255,255,0.05)',
    boxShadow: 'rgb(0 0 0 / 10%) 0px 3px 8px',
    background: '$electronTrayDockOpenBg',
  },
  variants: {
    open: {
      true: {
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: 'rgb(0 0 0 / 10%) 0px 3px 8px',
        background: '$electronTrayDockOpenBg',
        borderTopLeftRadius: '0',
        borderTopRightRadius: '0',
        borderTop: '0',
      },
    },
  },
})

const StatusDropdown = styled(StyledDropdownContent, {
  position: 'absolute',
  bottom: '35px',
  left: '-22px',
  width: '250px',
  background: '$dockBg',
  border: '1px solid $dockBorderColor',
  borderBottom: '0',
  borderRadius: '0',
  borderTopLeftRadius: '$medium',
  borderTopRightRadius: '$medium',
  backdropFilter: 'none',
  boxShadow: 'rgb(0 0 0 / 10%) 0px -10px 8px',
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
  [`& ${Dropdown.Label}`]: {
    paddingLeft: '6px',
    fontSize: '$base',
    color: 'rgba(255, 255, 255, 0.5)',
  },
})

const CurrentStatusIcon = styled('div', {
  center: true,
  height: '100%',
  color: 'rgba(255, 255, 255, 0.4)',
  '& svg': {
    aspectRatio: '1',
    height: '21px',
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
  borderRadius: '$medium',
  label: true,
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
  '&::selection': {
    background: '$electronTrayTextFieldSelectionBg',
  },
  '&::placeholder': {
    color: '$electronTrayTextFieldPlaceholder',
  },
})

const ModeIcon = styled('div', {
  width: '8px',
  aspectRatio: '1',
  round: true,
  background: '$green',
  marginTop: '2px',
  variants: {
    mode: {
      [PresenceStatus.Online]: {
        background: '$green',
      },
      [PresenceStatus.Focus]: {
        background: '$yellow',
      },
      [PresenceStatus.Zen]: {
        background: '$red',
      },
    },
  },
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

const LocalPresenceMode = styled('div', {
  height: '24px',
  '& div': {
    height: '100%',
  },
})

const Separator = styled('div', {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.05)',
  width: 'calc(100% + 12px)',
  margin: '4px 0 8px -6px',
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
