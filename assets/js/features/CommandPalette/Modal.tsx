import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { Command } from 'features/CommandRegistry'
import Icon from 'components/Icon'
import logger from 'lib/log'
// import { useSelector, useDispatch } from 'state'

export interface Props {
  title: string
  icon: string
  placeholder: string
  commands: Command[]
  query: string
  setQuery: (q: string) => void
  selectedId?: string
  select: (id: string) => void
  close: () => void
}

const log = logger('command-palette')

export default function CommandPaletteModal(props: Props) {
  const inputEl = useRef<HTMLInputElement>(null)
  const listEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!props.selectedId || !listEl.current) {
      return
    }

    const scrollTop = getScrollPosition(listEl, `${props.selectedId}`)
    if (scrollTop !== undefined) {
      listEl.current.scrollTop = scrollTop
    }
  }, [props.selectedId])

  return (
    <Overlay onClick={handleClickOutside}>
      <Outer>
        <Modal>
          <Title>
            <IconWrapper>
              <Icon name={props.icon} />
            </IconWrapper>
            {props.title}
          </Title>
          <Input
            ref={inputEl}
            value={props.query}
            placeholder={props.placeholder}
            onChange={handleChange}
            onBlur={bringBackFocus}
            autoFocus
          />
          <Separator
            hidden={
              props.commands.length == 0 ||
              props.commands[0].id == props.selectedId
            }
          />
          <Commands ref={listEl}>
            {props.commands.map((cmd, ind) => (
              <Command
                key={cmd.id}
                onClick={() => handleClick(cmd.id)}
                data-id={cmd.id}
                selected={props.selectedId == cmd.id}
              >
                <Name>{cmd.name}</Name>
                {cmd.hint ? <Hint>{cmd.hint}</Hint> : null}
                {cmd.shortcut ? (
                  <Hint>
                    {cmd.shortcut.map((s) => (
                      <Kbd>{s}</Kbd>
                    ))}
                  </Hint>
                ) : null}
              </Command>
            ))}
          </Commands>
        </Modal>
      </Outer>
    </Overlay>
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.setQuery(e.currentTarget.value)
  }

  function handleClick(id: string) {
    props.select(id)
  }

  function handleClickOutside() {
    props.close()
  }

  function bringBackFocus() {
    if (inputEl.current) inputEl.current.focus()
  }
}

const Overlay = styled('div', {
  position: 'absolute',
  width: '100vw',
  height: '100vh',
  center: true,
  top: 0,
  left: 0,
  zIndex: '$modal',
})

const Outer = styled('div', {
  position: 'relative',
  height: '400px',
})

const Modal = styled('main', {
  width: 640,
  minWidth: 'min-content',
  background: '$commandPaletteBg',
  color: '$commandPaletteFg',
  borderRadius: '$large',
  boxShadow: 'rgb(0 0 0 / 50%) 0px 16px 70px',
  border: '0.5px solid rgba(82, 82, 111, 0.44)',
  backdropFilter: 'blur(20px) saturate(190%) contrast(70%) brightness(80%)',
  overflow: 'hidden',
})

const IconWrapper = styled('aside', {
  width: '16px',
  height: '16px',
  '& svg': {
    fill: '$commandPaletteHeaderFg',
  },
})

const Title = styled('div', {
  display: 'inline-flex',
  space: { outer: [5, 5, 2, 5], inner: [0, 2], gap: 2 },
  round: 'small',
  alignItems: 'center',
  unitHeight: 8,
  fontSize: '$small',
  fontWeight: '$medium',
  letterSpacing: '$tight',
  colors: { fg: '$commandPaletteTitleFg', bg: '$commandPaletteTitleBg' },
  label: true,
})

const Input = styled('input', {
  display: 'block',
  width: 'calc(100% - 20px)',
  unitHeight: 10,
  space: { outer: [1, 5, 5, 5] },
  colors: {
    bg: 'transparent',
    fg: '$commandPaletteInputFg',
    caret: '$commandPaletteCaretColor',
    placeholderFg: '$commandPalettePlaceholderFg',
    selectionBg: '$commandPaletteInputSelectionBg',
    selectionFg: '$commandPaletteInputSelectionFg',
  },
  border: 0,
  outline: 'none',
  lineHeight: '$tight',
  fontFamily: '$sans',
  fontWeight: '$normal',
  fontSize: '$large',
  letterSpacing: '$wide',
})

const Separator = styled('div', {
  height: '1px',
  space: { outer: [0, 5] },
  background: '$commandPaletteSeparatorBg',
  variants: {
    hidden: {
      true: {
        background: 'transparent',
      },
    },
  },
})

const Commands = styled('div', {
  maxHeight: '33vh',
  overflowY: 'scroll',
})

const Command = styled('div', {
  vcenter: true,
  height: 60,
  space: { inner: [0, 5] },
  color: '$commandPaletteCommandFg',
  borderLeft: '3px solid transparent',
  label: true,
  variants: {
    selected: {
      true: {
        color: '$commandPaletteSelectedCommandFg',
        borderColor: '$commandPaletteSelectedCommandBorder',
        background: '$commandPaletteSelectedCommandBg',
      },
    },
  },
})

const Name = styled('div', {})
const Hint = styled('div', {
  marginLeft: 'auto',
  textAlign: 'right',
})

const Kbd = styled('kbd', {})

export function getScrollPosition(
  listEl: React.RefObject<HTMLDivElement>,
  rowId: string
): number | undefined {
  if (!listEl.current) return

  const rowEl: HTMLElement | undefined = Array.prototype.slice
    .call(listEl.current.children)
    .find((el) => el.getAttribute('data-id') === rowId)

  if (!rowEl) return

  return visibleScrollPosition(listEl.current, rowEl)
}

// Take a scrollable element and an item inside, return the scroll position
// that would ensure the item is visible.
export function visibleScrollPosition(
  scrollEl: HTMLElement,
  itemEl: HTMLElement,
  spacing?: { top: number; bottom: number }
): number {
  const listRect = scrollEl.getBoundingClientRect()
  const itemRect = itemEl.getBoundingClientRect()

  const isItemCutFromTop = itemRect.top - (spacing?.top || 0) < listRect.top
  const isItemCutFromBottom =
    itemRect.bottom + (spacing?.bottom || 0) > listRect.bottom

  const scrollTop = scrollEl.scrollTop

  if (isItemCutFromTop) {
    return scrollTop - (listRect.top + (spacing?.top || 0) - itemRect.top)
  }

  if (isItemCutFromBottom) {
    return (
      scrollTop + (itemRect.bottom + (spacing?.bottom || 0) - listRect.bottom)
    )
  }

  return scrollTop
}
