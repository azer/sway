import * as React from 'react'

export function SendIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4.75 19.25 12 4.75l7.25 14.5-7.25-3.5-7.25 3.5ZM12 15.5v-2.75"
      />
    </svg>
  )
}
