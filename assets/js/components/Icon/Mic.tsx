import * as React from 'react'
import { useSelector } from 'react-redux'

export default function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="4 4 16 16" width="100%" height="100%" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8.75 8a3.25 3.25 0 0 1 6.5 0v3a3.25 3.25 0 0 1-6.5 0V8Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5.75 12.75s.25 4.5 6.25 4.5 6.25-4.5 6.25-4.5M12 17.75v1.5"
      />
    </svg>
  )
}
