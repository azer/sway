import { styled } from 'themes'
import React, { useState } from 'react'
import selectors from 'selectors'
// import { useSelector, useDispatch } from 'state'

interface Props {
  ids: string[]
}

export function CallTile(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  })

  return <></>
}
