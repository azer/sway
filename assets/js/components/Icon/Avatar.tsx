import * as React from 'react'

export function AvatarIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M6.75 19S8 15.75 12 15.75 17.25 19 17.25 19m-3-9a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-6.5 9.25h8.5a3 3 0 0 0 3-3v-8.5a3 3 0 0 0-3-3h-8.5a3 3 0 0 0-3 3v8.5a3 3 0 0 0 3 3Z"
      />
    </svg>
  )
}
