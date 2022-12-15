import { removeListener } from '@reduxjs/toolkit'
import logger from 'lib/log'
import React, { useContext, useEffect, useState } from 'react'
// import { useSelector, useDispatch } from 'state'

const log = logger('command-registry')

interface Props {
  children: React.ReactNode
}

export interface Command {
  icon?: string
  id: string
  name: string
  hint?: string
  keywords?: string[]
  when?: boolean
  type?: CommandType
  shortcut?: string[]
  callback?: (_: string) => void
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

export enum CommandType {
  Settings = 'settings',
  AlterMode = 'alter-mode',
  AlterSession = 'alter-session',
  Misc = 'misc',
}

interface Params {
  id?: string
  name?: string
}

type RegisterFn = (
  name: string,
  callback: (input: string) => void,
  options?: Partial<Omit<Command, 'name' | 'callback'>>
) => string

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
    search,
    useRegister,
  }

  function add(
    name: string,
    callback: (input: string) => void,
    options?: Omit<Command, 'name' | 'callback'>
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
    fn: (r: RegisterFn) => void,
    deps: React.DependencyList
  ) {
    const registered: string[] = []

    useEffect(() => {
      fn(register)

      return () => {
        remove(registered.splice(0, registered.length))
      }
    }, deps)

    function register(
      name: string,
      callback: (input: string) => void,
      options?: Omit<Command, 'name' | 'callback'>
    ) {
      const id = add(name, callback, options)
      registered.push(id)
      return id
    }
  }

  function search(rawQuery: string): Command[] {
    const query = rawQuery.trim()

    const result: Command[] = []
    for (const [_, cmd] of Object.entries(commands)) {
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

    return result.sort(sortByMatchingScore(query))
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
  [CommandType.AlterMode]: 40,
  [CommandType.Settings]: 20,
  [CommandType.AlterSession]: 1,
  [CommandType.Misc]: 0,
}

function calculateMatchingScore(a: Command, query: string): number {
  let score = 0

  if (a.name === query) {
    score += 10
  } else if (a.name.startsWith(query)) {
    score += 7.5
  } else if (a.name.includes(query)) {
    score += 5
  } else if (a.keywords && a.keywords.find((k) => k.startsWith(query))) {
    score += 3
  }

  if (a.when !== undefined && a.when) score += 20
  if (a.type !== undefined) score += ContextMatchScores[a.type]

  return score
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
