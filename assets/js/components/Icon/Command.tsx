import * as React from 'react'

export default function Command(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4.75 6.5a1.75 1.75 0 1 1 3.5 0v1.75H6.5A1.75 1.75 0 0 1 4.75 6.5ZM15.75 6.5a1.75 1.75 0 1 1 1.75 1.75h-1.75V6.5ZM15.75 15.75h1.75a1.75 1.75 0 1 1-1.75 1.75v-1.75ZM4.75 17.5c0-.966.784-1.75 1.75-1.75h1.75v1.75a1.75 1.75 0 1 1-3.5 0ZM8.25 8.25h7.5v7.5h-7.5v-7.5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
