import React, { useEffect } from 'react'
import { init, SearchIndex } from 'emoji-mart'
import { logger } from 'lib/log'

interface Props {}

const log = logger('emoji/provider')

const DATA_URL = 'https://cdn.jsdelivr.net/npm/@emoji-mart/data'

export function EmojiProvider(_: Props) {
  useEffect(() => {
    log.info('Loading emoji-mart data', DATA_URL)

    fetch(DATA_URL)
      .then(async (resp) => {
        log.info('Emoji data loaded')
        init({ data: await resp.json() })
      })
      .catch((err) => log.error("can't load emojis", err))
  }, [])

  return <></>
}
