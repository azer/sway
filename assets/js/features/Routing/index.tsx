import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Main from './Main'

export default function Routing(): JSX.Element {
  const reg = useCommandRegistry()
  const cmd = useCommandPalette()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/rooms/:slug" element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}
