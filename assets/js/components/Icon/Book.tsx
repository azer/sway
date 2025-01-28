import * as React from 'react'

export function BookIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M19.25 15.25v-9.5a1 1 0 0 0-1-1H6.75a2 2 0 0 0-2 2v10"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19.25 15.25H6.75a2 2 0 1 0 0 4h12.5v-4Z"
      />
    </svg>
  )
}
