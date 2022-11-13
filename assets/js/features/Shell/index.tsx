import React from 'react'
import { useSelector } from 'state'
import { styled } from 'themes'
import selectors from 'selectors'

interface Props {
  children?: React.ReactNode
}

export default function Shell(props: Props) {
  const [isLoggedIn] = useSelector((state) => [
    selectors.session.isLoggedIn(state),
  ])

  return (
    <Container>
      <Sidebar />
    </Container>
  )
}

const Container = styled('main', {
  background: '$shellBg',
  color: '$shellFg',
  width: '100vw',
  height: '100vh',
  display: 'flex',
})

const Sidebar = styled('nav', {
  borderRight: '1px solid $shellBorderColor',
  width: '220px',
  height: '100%',
  color: '$white',
  display: 'flex',
})
