// import { useDispatch, useSelector } from 'state'
import React, { useContext, useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { logger } from 'lib/log'
import Modal from './Modal'
import { performSearch } from 'features/CommandRegistry'

const log = logger('command-palette')

interface Props {
  children: React.ReactNode
}

export enum CommandType {
  Settings = 'settings',
  AlterMode = 'alter-mode',
  AlterSession = 'alter-session',
  Misc = 'misc',
}

export interface Palette {
  modal: (
    parentModal?: () => ModalProps,
    nextModal?: () => ModalProps
  ) => ModalProps
  commands: () => Command[]
}

export interface Command {
  icon?: string
  id: string
  name: string
  value?: unknown
  hint?: string
  error?: string
  suffix?: string
  prefix?: string
  keywords?: string[]
  when?: boolean
  pin?: boolean
  hidden?: boolean
  type?: CommandType
  shortcut?: string[]
  callback?: (_: string) => void
  palette?: Palette
  disableClick?: boolean
}

export interface ModalProps {
  id: string
  title: string
  icon: string
  placeholder: string
  preview?: (_: { selectedValue: unknown }) => JSX.Element
  selectedId?: string
  parentModal?: () => ModalProps
  nextModal?: () => ModalProps
  prevModal?: ModalProps
  search?: (commands: Command[], query: string) => Command[]
  commands?: () => Command[]
  callback?: (id: string | undefined, query: string) => void
  submodalCallback?: (
    submodalId: string,
    id: string | undefined,
    query: string
  ) => void
}

const defaultModal: ModalProps = {
  id: '',
  title: '',
  icon: '',
  placeholder: '',
}

const context = React.createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  modal: ModalProps
  setModal: React.Dispatch<React.SetStateAction<ModalProps>>
  commands: Command[]
  setCommands: React.Dispatch<React.SetStateAction<Command[]>>
  fullScreen: boolean
  setFullScreen: React.Dispatch<React.SetStateAction<boolean>>
  setQuery: React.Dispatch<React.SetStateAction<string>>
}>({
  isOpen: false,
  fullScreen: false,
  setFullScreen: noop,
  setIsOpen: noop,
  modal: defaultModal,
  setModal: noop,
  commands: [],
  setCommands: noop,
  setQuery: noop,
})

export default function CommandPaletteProvider(props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const [modalProps, setModalProps] = useState<ModalProps>({
    ...defaultModal,
  })

  const [query, setQuery] = useState('')
  const [commands, setCommands] = useState<Command[]>([])
  const [results, setResults] = useState<Command[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(
    modalProps.selectedId
  )

  const selectedCmd = commands.find((c) => c.id === selectedId)
  const selectedValue: unknown =
    selectedCmd?.value !== undefined ? selectedCmd.value : selectedId

  useHotkeys(
    'up',
    previous,
    {
      enabled: isOpen,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [selectedId, results]
  )

  useHotkeys(
    'down',
    next,
    { enabled: isOpen, enableOnFormTags: true, preventDefault: true },
    [selectedId, results]
  )

  useHotkeys(
    'enter',
    proceedWithSelection,
    {
      enabled: isOpen,
      enableOnFormTags: true,
    },
    [selectedId, modalProps, proceedWithSelection]
  )

  useHotkeys(
    'esc',
    backOrClose,
    {
      enabled: isOpen,
      enableOnFormTags: true,
    },
    [modalProps]
  )

  useHotkeys(
    'alt+l',
    () => setFullScreen(!fullScreen),
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [fullScreen]
  )

  useEffect(() => {
    const rows = (modalProps.search || performSearch)(commands, query)
    setResults(rows)

    if (!rows.find((r) => r.id === selectedId) && query === '') {
      setSelectedId(modalProps.selectedId || rows[0]?.id)
    }
  }, [commands, query])

  useEffect(() => {
    setSelectedId(results[0]?.id)
  }, [results])

  useEffect(() => {
    if (modalProps.commands) {
      log.info('Reset commands after modal change', modalProps.id)
      setCommands(modalProps.commands())
    }
  }, [modalProps.id])

  return (
    <context.Provider
      value={{
        isOpen,
        setIsOpen,
        commands,
        setCommands,
        setQuery,
        modal: modalProps,
        setModal: setModalProps,
        fullScreen: fullScreen,
        setFullScreen: setFullScreen,
      }}
    >
      {isOpen ? (
        <Modal
          title={modalProps.title}
          placeholder={modalProps.placeholder}
          icon={modalProps.icon}
          commands={results}
          selectedId={selectedId}
          initiallySelectedId={modalProps.selectedId}
          selectedValue={selectedValue}
          setSelectedId={setSelectedId}
          selectAndProceed={selectAndProceed}
          close={close}
          query={query}
          setQuery={setQuery}
          preview={modalProps.preview}
          fullScreen={fullScreen}
        />
      ) : null}
      {props.children}
    </context.Provider>
  )

  function backOrClose() {
    if (modalProps.parentModal) {
      switchModal(modalProps.parentModal())
    } else {
      close()
    }
  }

  function close() {
    log.info('Close command palette', modalProps.id)
    setIsOpen(false)
    setQuery('')
  }

  function previous() {
    const prevId = getNextIndexId(-1)
    if (prevId) {
      setSelectedId(prevId)
    }
  }

  function next() {
    const nextId = getNextIndexId()
    if (nextId) {
      setSelectedId(nextId)
    }
  }

  function selectAndProceed(id: string) {
    proceed(id, query)
  }

  function proceedWithSelection() {
    proceed(selectedId, query)
  }

  function getNextIndexId(jumpBy?: number) {
    const currentIndex = results.findIndex((c) => c.id === selectedId)
    const nextIndex = currentIndex + (jumpBy === undefined ? 1 : jumpBy)

    if (currentIndex === -1) {
      return results[results.length - 1].id
    }

    if (nextIndex >= results.length || nextIndex < 0) {
      return
    }

    return results[nextIndex].id
  }

  function proceed(cmdId: string | undefined, query: string) {
    const cmd = cmdId ? findById(cmdId) : undefined
    const parent = modalProps.parentModal ? modalProps.parentModal() : undefined

    setQuery('')

    if (cmd?.id === 'back') {
      backOrClose()
      return
    }

    if (parent?.submodalCallback) {
      parent.submodalCallback(modalProps.id, cmdId, query)
    }

    if (cmd && cmd.palette) {
      switchModal(cmd.palette.modal(() => modalProps))
      return
    }

    if (cmd && cmd.callback) {
      cmd.callback(query)
    }

    if (modalProps.callback) return modalProps.callback(cmdId, query)

    log.info('next modal:', modalProps, modalProps)

    if (modalProps.nextModal) {
      const next = modalProps.nextModal()
      switchModal(next)
      return
    }

    if (parent) {
      switchModal(parent)
      return
    }

    close()
  }

  function switchModal(nextModalProps: ModalProps) {
    log.info(
      'Switching command palette context. %s -> %s',
      modalProps.id,
      nextModalProps.id
    )

    nextModalProps.prevModal = modalProps

    setIsOpen(true)
    setQuery('')
    //setResults([])
    setSelectedId(nextModalProps.selectedId)
    setModalProps(nextModalProps)
  }

  function findById(id: string): Command | undefined {
    return commands.find((c) => c.id === id) || results.find((c) => c.id === id)
  }
}

export function useCommandPalette() {
  const {
    isOpen,
    setIsOpen,
    setModal,
    modal,
    commands,
    setCommands,
    fullScreen,
    setFullScreen,
    setQuery,
  } = useContext(context)

  return {
    id: modal.id,
    isOpen,
    open,
    close,
    getCommands: () => commands,
    setCommands,
    setFullScreen,
    fullScreen,
    setProps,
    setQuery,
  }

  function open(commands: Command[], modalProps: ModalProps) {
    if (isOpen) return close()

    log.info('Open command palette', modalProps.id, commands)

    setCommands(commands)
    setModal(modalProps)
    setFullScreen(false)
    setIsOpen(true)
  }

  function close() {
    log.info('Close command palette', modal.id, modal)

    if (modal.parentModal) {
      setModal(modal.parentModal())
    } else {
      setIsOpen(false)
    }
  }

  function setProps(props: ModalProps) {
    setModal({
      ...props,
    })
  }
}

function noop() {
  log.info('noop function called')
}
