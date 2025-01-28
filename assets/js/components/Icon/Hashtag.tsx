import * as React from 'react'

export function HashtagIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="m10.25 4.75-2.5 14.5M16.25 4.75l-2.5 14.5M19.25 8.75H5.75M18.25 15.25H4.75"
      />
    </svg>
  )
}
