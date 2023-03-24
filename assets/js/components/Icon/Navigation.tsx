import * as React from 'react'

export function NavigationIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12.75 4.75h4.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-4.5m-8-2V6.75a2 2 0 0 1 2-2h2.5v14.5h-2.5a2 2 0 0 1-2-2Z"
      />
    </svg>
  )
}
