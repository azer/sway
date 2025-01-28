import * as React from 'react'

export function DoorEnterIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10.25 4.75h-3.5a2 2 0 0 0-2 2v12.5h10.5v-6.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4.75 19.25h14.5M16.25 9.25 13.75 7m0 0 2.5-2.25M13.75 7h5.5"
      />
    </svg>
  )
}
