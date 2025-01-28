import * as React from 'react'

export function LiveStreamIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M15.75 5.75c1.959 1.298 3.5 3.724 3.5 6.25s-1.541 4.952-3.5 6.25M8.25 5.75C6.291 7.048 4.75 9.474 4.75 12s1.541 4.952 3.5 6.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.75 8.75c.772.77 1.5 2.074 1.5 3.25 0 1.176-.728 2.48-1.5 3.25M9.25 8.75c-.772.77-1.5 2.074-1.5 3.25 0 1.176.728 2.48 1.5 3.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
