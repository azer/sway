import * as React from 'react'

export function PictureInPictureIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.25 17.25h-.5a2 2 0 0 1-2-2v-8.5a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v2.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.75 13.75a1 1 0 0 1 1-1h6.5a1 1 0 0 1 1 1v4.5a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-4.5Z"
      />
    </svg>
  )
}
