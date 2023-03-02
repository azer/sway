import { SearchIndex } from 'emoji-mart'
import { logger } from 'lib/log'
import { useEffect, useState } from 'react'

const log = logger('emoji/use-emoji-search')

export type EmojiObject = {
  id: string
  name: string
  keywords?: string[]
  skins: {
    unified: string
    native: string
    shortcodes: string
  }[]
  version?: number
  search?: string
}

export function useEmojiSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<EmojiObject[]>([])

  useEffect(() => {
    log.info('Updating search results', query)

    if (query.trim().length === 0) {
      setResults([])
      return
    }

    // @ts-ignore
    SearchIndex.search(query, { maxResults: 25 })
      .then((results: EmojiObject[]) => {
        log.info('Update emoji results', results)
        setResults(results || [])
      })
      .catch((err: Error) => {
        log.error('Something went wrong with search', err)
      })
  }, [query])

  return {
    query: query,
    setQuery: setQuery,
    results: results,
    setResults: setResults,
  }
}
