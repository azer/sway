import * as React from 'react'

export function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="m6.75 7.75.841 9.673a2 2 0 0 0 1.993 1.827h4.832a2 2 0 0 0 1.993-1.827l.841-9.673M9.75 7.5v-.75a2 2 0 0 1 2-2h.5a2 2 0 0 1 2 2v.75M5 7.75h14"
      />
    </svg>
  )
}
