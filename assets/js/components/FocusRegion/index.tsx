import { styled } from 'themes'
import React from 'react'
import { useSelector, useDispatch } from 'state'
import { switchFocus } from 'features/Focus/slice'

interface Props {
  name: string
  children: React.ReactNode
}

export function FocusRegion(props: Props) {
  const dispatch = useDispatch()

  return (
    <section data-region={props.name} onClick={handleClick}>
      {props.children}
    </section>
  )

  function handleClick() {
    dispatch(switchFocus(props.name))
  }
}
