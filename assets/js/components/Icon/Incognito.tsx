import * as React from 'react'

export function IncognitoIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M13.25 16.75h-2.5m-6-4s.409-.354 1.25-.764m0 0c1.16-.564 3.139-1.236 6-1.236s4.84.672 6 1.236m-12 0 .564-5.442a2 2 0 0 1 1.99-1.794h6.893a2 2 0 0 1 1.989 1.794L18 11.986m0 0c.841.41 1.25.764 1.25.764m-9 4.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm8 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      />
    </svg>
  )
}
