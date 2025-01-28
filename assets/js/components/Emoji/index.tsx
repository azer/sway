import React from 'react'

interface Props {
  id: string
  size?: string
}

export function Emoji(props: Props) {
  // @ts-ignore
  return <em-emoji id={props.id} size={props.size}></em-emoji>
}
