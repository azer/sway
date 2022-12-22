// import { useDispatch, useSelector } from 'state'
import React, { useContext, useEffect, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Command } from 'features/CommandRegistry'
import logger from 'lib/log'
import Modal from './Modal'

const log = logger('command-palette')

interface Props {
  children: React.ReactNode
}

interface ModalProps {
  title: string
  icon: string
  placeholder: string
  search: (query: string) => Command[]
  callback: (id: string | undefined, query: string) => void
}

const defaultModal: ModalProps = {
  title: '',
  icon: '',
  placeholder: '',
  search: (query: string) => {
    log.error('Noop search function got called')
    return []
  },
  callback: noop,
}

const context = React.createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  modal: ModalProps
  setModal: React.Dispatch<React.SetStateAction<ModalProps>>
  selectedIndex: number
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>
}>({
  isOpen: false,
  setIsOpen: noop,
  modal: defaultModal,
  setModal: noop,
  selectedIndex: -1,
  setSelectedIndex: noop,
})

export default function CommandPaletteProvider(props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalProps, setModalProps] = useState<ModalProps>({
    ...defaultModal,
  })

  const [query, setQuery] = useState('')
  const [commands, setCommands] = useState<Command[]>([])
  const [selectedId, setSelectedId] = useState<string>()

  useHotkeys(
    'up',
    previous,
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [selectedId]
  )

  useHotkeys('down', next, { enableOnFormTags: true, preventDefault: true }, [
    selectedId,
  ])

  useHotkeys(
    'enter',
    selectFocused,
    {
      enableOnFormTags: true,
    },
    [selectFocused]
  )

  useHotkeys('esc', close, {
    enableOnFormTags: true,
  })

  useEffect(() => {
    const results = modalProps.search(query)
    setCommands(results)
    setSelectedId(results[0]?.id || undefined)
  }, [modalProps.search, query])

  return (
    <context.Provider
      value={{
        isOpen,
        setIsOpen,
        modal: modalProps,
        setModal: setModalProps,
      }}
    >
      {isOpen ? (
        <Modal
          title={modalProps.title}
          placeholder={modalProps.placeholder}
          icon={modalProps.icon}
          commands={commands}
          selectedId={selectedId}
          select={selectById}
          close={close}
          query={query}
          setQuery={setQuery}
        />
      ) : null}
      {props.children}
    </context.Provider>
  )

  function close() {
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

  function selectById(id: string) {
    modalProps.callback(id, query)
  }

  function selectFocused() {
    modalProps.callback(selectedId, query)
    close()
  }

  function getNextIndexId(jumpBy?: number) {
    const currentIndex = commands.findIndex((c) => c.id === selectedId)
    const nextIndex = currentIndex + (jumpBy === undefined ? 1 : jumpBy)

    if (currentIndex === -1) {
      return commands[commands.length - 1].id
    }

    if (nextIndex >= commands.length || nextIndex < 0) {
      return
    }

    return commands[nextIndex].id
  }
}

export function useCommandPalette() {
  const { isOpen, setIsOpen, setModal, modal } = useContext(context)

  return {
    isOpen,
    open,
    close,
  }

  function open(modalProps: ModalProps) {
    if (isOpen) return close()

    setModal(modalProps)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }
}

function noop() {
  log.info('noop function called')
}
