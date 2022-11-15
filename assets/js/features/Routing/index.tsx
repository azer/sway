import React, { useEffect } from 'react'
import { useDispatch } from 'state'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { addInitialState } from '../../state/entities'
import Main from './Main'

export default function Routing(): JSX.Element {
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('Adding initial state...')
    dispatch(addInitialState())
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}
