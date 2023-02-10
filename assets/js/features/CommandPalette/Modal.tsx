import { styled } from 'themes'
import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { Command } from 'features/CommandPalette'
import Icon from 'components/Icon'
import { logger } from 'lib/log'
import { keySymbol } from 'lib/shortcuts'
// import { useSelector, useDispatch } from 'state'

export interface Props {
  title: string
  icon: string
  placeholder: string
  commands: Command[]
  preview?: (_: { selectedValue: unknown }) => JSX.Element
  query: string
  setQuery: (q: string) => void
  selectedId?: string
  selectedValue?: unknown
  initiallySelectedId?: string
  setSelectedId: (id: string) => void
  selectAndProceed: (id: string) => void
  close: () => void
  fullScreen: boolean
}

const log = logger('command-palette/modal')

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

  let Preview: ((_: { selectedValue: unknown }) => JSX.Element) | null = null
  if (props.preview) Preview = props.preview

  return (
    <Overlay
      onClick={handleClickOutside}
      data-selected-id={props.selectedId || ''}
    >
      <Outer fullScreen={props.fullScreen}>
        <Modal fullScreen={props.fullScreen}>
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
          <Grid
            autoHeight={props.commands.length <= 4 && !props.preview}
            preview={!!props.preview}
            fullScreen={props.fullScreen}
          >
            <Navigation>
              <Commands ref={listEl} pin={props.commands.some((c) => c.pin)}>
                {props.commands.map((cmd, ind) => (
                  <Command
                    key={cmd.id}
                    onClick={() => !cmd.disableClick && handleClick(cmd.id)}
                    data-id={cmd.id}
                    selected={props.selectedId == cmd.id}
                    title={cmd.hint}
                    highlighted={props.initiallySelectedId == cmd.id}
                    onMouseMove={() => props.setSelectedId(cmd.id)}
                    pin={cmd.pin && props.commands.length > 4}
                  >
                    <Border selected={props.selectedId == cmd.id} />
                    <CommandIcon
                      selected={
                        props.selectedId == cmd.id ||
                        props.initiallySelectedId == cmd.id
                      }
                    >
                      {cmd.icon ? <Icon name={cmd.icon} /> : null}
                    </CommandIcon>
                    <Name>
                      {cmd.name}
                      {cmd.suffix ? <Suffix>{cmd.suffix}</Suffix> : null}
                    </Name>
                    {cmd.hint || cmd.error ? (
                      <Hint
                        selected={props.selectedId == cmd.id}
                        error={!!cmd.error}
                      >
                        {cmd.error || cmd.hint}
                      </Hint>
                    ) : null}
                    {cmd.shortcut ? (
                      <Hint>
                        {cmd.shortcut.map((s) => (
                          <Kbd key={s} selected={props.selectedId === cmd.id}>
                            {keySymbol(s)}
                          </Kbd>
                        ))}
                      </Hint>
                    ) : null}
                  </Command>
                ))}
              </Commands>
            </Navigation>
            {Preview ? (
              <>
                <PreviewSeparator />
                <Preview selectedValue={props.selectedValue} />
              </>
            ) : null}
          </Grid>
        </Modal>
      </Outer>
    </Overlay>
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.setQuery(e.currentTarget.value)
  }

  function handleClick(id: string) {
    props.selectAndProceed(id)
  }

  function handleClickOutside(event: MouseEvent) {
    if (event.currentTarget === event.target) {
      props.close()
    }
  }

  function bringBackFocus() {
    if (inputEl.current) inputEl.current.focus()
  }
}

const Overlay = styled('div', {
  position: 'absolute',
  width: '100vw',
  height: '100vh',
  top: 0,
  left: 0,
  zIndex: '$modal',
  hcenter: true,
})

const Outer = styled('div', {
  position: 'relative',
  top: '17.5vh',
  height: 'min-content',
  variants: {
    fullScreen: {
      true: {
        top: '24px',
        height: 'calc(100vh - 48px)',
        width: 'calc(100vw - 48px)',
      },
    },
  },
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
  variants: {
    fullScreen: {
      true: {
        width: '100%',
        height: '100%',
      },
    },
  },
})

const Grid = styled('div', {
  height: '330px',
  variants: {
    autoHeight: {
      true: {
        height: 'auto',
      },
    },
    preview: {
      true: {
        display: 'grid',
        gridTemplateColumns: '45% 1px calc(55% - 1px)',
      },
    },
    fullScreen: {
      true: {
        height: 'calc(100% - 120px)',
      },
    },
  },
})

const IconWrapper = styled('aside', {
  width: '12px',
  height: '12px',
  '& svg': {},
})

const Title = styled('header', {
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
  width: 'calc(100%)',
  height: '1px',
  background: '$commandPaletteSeparatorBg',
  variants: {
    hidden: {
      true: {
        // background: 'transparent',
      },
    },
  },
})

const Commands = styled('nav', {
  height: '100%',
  overflowY: 'auto',
  /*'&::-webkit-scrollbar': {
    width: '7.5px',
    opacity: '0',
    background: 'transparent',
  },
  '&::-webkit-scrollbar-track': {
    background: '$scrollTrackBg',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '$scrollThumbBg',
    borderRadius: '2px',
    width: '6px',
  },
  '&::-webkit-scrollbar:hover': {
    opacity: '1',
  },*/
  variants: {
    pin: {
      true: {
        height: 'calc(100% - 60px)',
      },
    },
  },
})

const Border = styled('mark', {
  width: '3.5px',
  height: '100%',
  position: 'absolute',
  top: '0',
  left: '0',
  background: 'transparent',
  variants: {
    selected: {
      true: {
        background: `radial-gradient(60px at 0px 0px, $lightPurple, transparent), radial-gradient(60px at 0px 50%, $candy, transparent)`,
      },
    },
  },
})

const Command = styled('div', {
  position: 'relative',
  vcenter: true,
  height: 60,
  space: { inner: [0, 5] },
  color: '$commandPaletteCommandFg',
  label: true,
  variants: {
    selected: {
      true: {
        color: '$commandPaletteSelectedCommandFg',
        background: '$commandPaletteSelectedCommandBg',
      },
    },
    highlighted: {
      true: {
        color: '$commandPaletteHighlightedCommandFg',
      },
    },
    pin: {
      true: {
        width: '100%',
        position: 'absolute',
        bottom: '0',
        borderTop: '1px solid $commandPaletteSeparatorBg',
      },
    },
  },
})

const CommandIcon = styled('div', {
  width: '14px',
  height: '14px',
  marginRight: '12px',
  color: '$commandPaletteCommandIconFg',
  variants: {
    selected: {
      true: {
        color: '$commandPaletteSelectedCommandIconFg',
      },
    },
  },
})

const Name = styled('div', {
  ellipsis: true,
})

const Suffix = styled('label', {
  color: '$gray9',
  marginLeft: '4px',
})

const Hint = styled('div', {
  position: 'absolute',
  maxWidth: '30%',
  fontSize: '$small',
  right: '20px',
  textAlign: 'right',
  ellipsis: true,
  color: '$commandPaletteHintFg',
  variants: {
    selected: {
      true: {
        color: '$commandPaletteSelectedHintFg',
      },
    },
    error: {
      true: {
        color: '$commandPaletteErrorFg',
      },
    },
  },
})

const Kbd = styled('kbd', {
  display: 'inline-block',
  textAlign: 'center',
  fontWeight: '500',
  minWidth: '20px',
  marginRight: '3px',
  fontSize: '11px',
  padding: '4px 3px 4px 4px',
  background: '$commandPaletteShortcutBg',
  round: 'small',
  textTransform: 'capitalize',
  label: true,
  fontFamily: '$sans',
  variants: {
    selected: {
      true: {
        background: '$commandPaletteSelectedShortcutBg',
        color: '$commandPaletteSelectedShortcutFg',
      },
    },
  },
})

const Navigation = styled('div', {
  position: 'relative',
  height: '100%',
  overflow: 'hidden',
})

const PreviewSeparator = styled('div', {
  width: '1px',
  height: '100%',
  background: '$commandPaletteSeparatorBg',
})

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
