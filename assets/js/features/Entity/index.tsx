import React, { useState } from 'react'
import { Schema, initialState } from 'state/entities'

const TrayStateContext = React.createContext({ entities: initialState })

interface Props {
  id: string
  schema: Schema
}

export function Entity(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return <></>
}

export function TrayWindowStateConsumer(props: { children: React.ReactNode }) {
    const [state, setState] = useState<typeof initialState>(initialState)

  return (
    <TrayStateContext.Provider value={{ entities: state }}>
      {props.children}
    </TrayStateContext.Provider>
  )
}
