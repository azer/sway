import { styled } from 'themes'
import React from 'react'
import { keySymbol } from 'lib/shortcuts'

interface Props {
  keys: string[]
  sep?: boolean
}

export function Kbd(props: Props) {
  return props.keys.length > 0 ? (
    <Keys>
      {props.keys.map((s, ind) => (
        <>
          {props.sep && ind !== 0 ? <Sep key={'step' + ind}>+</Sep> : null}
          <Key key={ind}>{keySymbol(s)}</Key>
        </>
      ))}
    </Keys>
  ) : null
}

export const Keys = styled('div', {
  display: 'inline-flex',
  gap: '$space1',
  marginLeft: 'auto',
  color: '$tooltipKeyFg',
})

export const Key = styled('div', {
  display: 'inline-flex',
  background: '$tooltipKeyBg',
  round: 'small',
  textTransform: 'capitalize',
  minWidth: '14px',
  padding: '0 5px',
  height: '20px',
  center: true,
})

const Sep = styled('div', {
  display: 'inline-flex',
  vcenter: true,
})
