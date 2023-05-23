import * as React from 'react'

export function MonitorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="4 4 16 16"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 6.75a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2v-7.5ZM15.25 19.25l-3.25-2-3.25 2"
      />
    </svg>
  )
}
