import { styled } from 'themes'
import React from 'react'
import Autolinker from 'autolinker'
import parse from 'html-react-parser'

interface Props {
  children: React.ReactNode
}

export function AutoLinkText(props: Props) {
  const children = React.useMemo(() => {
    const parsed = Autolinker.link(props.children as string, {
      truncate: { length: 30, location: 'middle' },
    })
    return parse(parsed)
  }, [props.children])

  return <>{children}</>
}
