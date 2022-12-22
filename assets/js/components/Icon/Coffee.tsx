import * as React from 'react'

export default function CoffeeIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M19.25 17.25v-8.5H7.75v8.5a2 2 0 0 0 2 2h7.5a2 2 0 0 0 2-2ZM7.5 10.75h-.75a2 2 0 0 0-2 2v1.5a2 2 0 0 0 2 2h.75M13.25 4.75v1.5M8.25 4.75s1 0 1 1.5M18.25 4.75s-1 0-1 1.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
