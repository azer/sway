import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
// import { useSelector, useDispatch } from 'state'

interface Props {
  icon: string
  children?: React.ReactNode
  onClick?: () => void
  tooltipLabel?: string
  tooltipShortcut?: string
}

export default function CallDockButton(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return <Container></Container>
}

const Container = styled('div', {})
