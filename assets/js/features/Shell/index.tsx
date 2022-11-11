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

  console.log(isLoggedIn)

  return (
    <Container>
      shell
      {isLoggedIn ? 'asd' : 'xxx'} {props.children}
    </Container>
  )
}

const Container = styled('main', {
  background: '$gray1',
  color: '$white',
  width: '100vw',
  height: '100vh',
})
