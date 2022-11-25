import React from 'react'
import Headphones from './Headphones'
import Coffee from './Coffee'
import PhoneCall from './PhoneCall'
import Night from './Night'
import Sliders from './Sliders'
import Terminal from './Terminal'
import Command from './Command'

const icons: {
  [k: string]: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
} = {
  headphones: Headphones,
  coffee: Coffee,
  phoneCall: PhoneCall,
  night: Night,
  sliders: Sliders,
  terminal: Terminal,
  command: Command,
}

interface Props extends React.SVGProps<SVGSVGElement> {
  name: string
}

export default function Icon(props: Props) {
  const IconComponent = icons[props.name]
  if (IconComponent) {
    return <IconComponent {...props} />
  }

  return null
}
