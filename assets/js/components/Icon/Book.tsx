import * as React from 'react'

export function BookIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M19.25 5.75a1 1 0 0 0-1-1H14a2 2 0 0 0-2 2v12.5l.828-.828a4 4 0 0 1 2.829-1.172h2.593a1 1 0 0 0 1-1V5.75ZM4.75 5.75a1 1 0 0 1 1-1H10a2 2 0 0 1 2 2v12.5l-.828-.828a4 4 0 0 0-2.829-1.172H5.75a1 1 0 0 1-1-1V5.75Z"
      />
    </svg>
  )
}
