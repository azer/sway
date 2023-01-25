import { Command, CommandType, ModalProps } from 'features/CommandPalette'
import logger from 'lib/log'
import React, { useContext, useEffect, useState } from 'react'
// import { useSelector, useDispatch } from 'state'

const log = logger('command-registry')

interface Props {
  children: React.ReactNode
}

const context = React.createContext<{
  commands: { [id: string]: Command }
  setCommands: React.Dispatch<React.SetStateAction<{ [id: string]: Command }>>
}>({
  commands: {},
  setCommands: noop,
})

export default function CommandRegistryProvider(props: Props) {
  const [commands, setCommands] = useState<{ [id: string]: Command }>({})
  return (
    <context.Provider value={{ commands, setCommands }}>
      {props.children}
    </context.Provider>
  )
}

type RegisterFn = (
  name: string,
  callback: (input: string) => void,
  options?: Partial<Omit<Command, 'name' | 'callback'>>
) => Command

type RegisterPaletteCommand = (
  options: ModalProps,
  commands: (input?: string) => Command[]
) => void

// useCommandRegistry({ set } => {
//   set()
// }, [])
//
// registry.add('Report bug', reportBug)
// registry.add('Log out', logout, { when: isLoggedIn, type: CommandType.AlterSession })
// registry.add('Edit', edit, { id: 'edit-n', when: hasFocus, type: CommandType.ActionOnFocus })
//
// regitry.search('eport')
export function useCommandRegistry() {
  const { commands, setCommands } = useContext(context)

  return {
    add,
    commands,
    useRegister,
  }

  function add(
    name: string,
    callback: (input: string) => void,
    options?: Partial<Omit<Command, 'name' | 'callback'>>
  ): string {
    const id = options?.id || slug(name)
    const command = {
      id,
      name,
      callback,
      ...options,
    }

    setCommands((cmds: { [id: string]: Command }) => {
      return {
        ...cmds,
        [id]: command,
      }
    })

    return id
  }

  function remove(ids: string[]) {
    setCommands((cmds: { [id: string]: Command }) => {
      const copy = {
        ...cmds,
      }

      for (const id of ids) {
        delete copy[id]
      }

      return copy
    })
  }

  function useRegister(
    fn: (r: RegisterFn, rp: RegisterPaletteCommand) => void,
    deps: React.DependencyList
  ) {
    const registered: string[] = []

    register.paletteCmd = registerPaletteCommand

    useEffect(() => {
      fn(register, registerPaletteCommand)

      return () => {
        remove(registered.splice(0, registered.length))
      }
    }, deps)

    function register(
      name: string,
      callback: (input: string) => void,
      options?: Partial<Omit<Command, 'name' | 'callback'>>
    ) {
      const id = add(name, callback, options)
      registered.push(id)
      return commands[id]
    }

    function registerPaletteCommand(
      options: ModalProps,
      commandGenerator: (input?: string) => Command[]
    ) {
      register(options.title, noop, {
        icon: options.icon,
        palette: {
          commands: () => commandGenerator(),
          modal: () => ({
            ...options,
            commands: () => commandGenerator(),
          }),
        },
      })
    }
  }
}

export function slug(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function sortByMatchingScore(query: string) {
  return (a: Command, b: Command): number => {
    const scoreA = calculateMatchingScore(a, query)
    const scoreB = calculateMatchingScore(b, query)
    return scoreB - scoreA
  }
}

const ContextMatchScores = {
  [CommandType.AlterMode]: 30,
  [CommandType.Settings]: 20,
  [CommandType.AlterSession]: 1,
  [CommandType.Misc]: 0,
}

function calculateMatchingScore(a: Command, rawQuery: string): number {
  const name = a.name.toLowerCase()
  const query = rawQuery.toLowerCase().toLowerCase()

  let score = 0

  if (name === query) {
    score += 15
  } else if (name.startsWith(query)) {
    score += 10
  } else if (name.includes(' ' + query)) {
    score += 7.5
  } else if (name.includes(query)) {
    score += 5
  } else if (a.keywords && a.keywords.find((k) => k.startsWith(query))) {
    score += 3
  }

  //if (a.when !== undefined && a.when) score += 20
  if (a.type !== undefined) score += ContextMatchScores[a.type]

  return score
}

export function performSearch(
  commands: Command[],
  rawQuery: string,
  options?: { tolerant: boolean }
): Command[] {
  const query = rawQuery.trim()
  const pinned: Command[] = []

  const result: Command[] = []
  for (const [_, cmd] of Object.entries(commands)) {
    if (cmd.pin === true) {
      pinned.push(cmd)
      continue
    }

    if (
      query.length > 0 &&
      !performKeywordSearch(query, [cmd.name, ...(cmd.keywords || [])])
    ) {
      continue
    }

    if (cmd.when === false) {
      continue
    }

    result.push(cmd)
  }

  if (result.length === 0 && options?.tolerant) {
    return commands
  }

  return result.sort(sortByMatchingScore(query)).concat(pinned)
}

export function findCommandById(
  commands: Command[],
  id: string
): Command | undefined {
  return commands.find((c) => c.id === id)
}

function performKeywordSearch(query: string, data: string[]) {
  for (const d of data) {
    if (fuzzysearch(query.toLowerCase(), d.toLowerCase())) {
      return true
    }
  }

  return false
}

// https://github.com/bevacqua/fuzzysearch
function fuzzysearch(needle: string, haystack: string): boolean {
  var hlen = haystack.length
  var nlen = needle.length
  if (nlen > hlen) {
    return false
  }
  if (nlen === hlen) {
    return needle === haystack
  }
  outer: for (var i = 0, j = 0; i < nlen; i++) {
    var nch = needle.charCodeAt(i)
    while (j < hlen) {
      if (haystack.charCodeAt(j++) === nch) {
        continue outer
      }
    }
    return false
  }
  return true
}

function noop() {
  log.info('noop function called')
}
