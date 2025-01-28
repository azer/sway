import * as React from 'react'

export function PressIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="m10 19.25-2.246-5.99a.018.018 0 0 1 .004-.018 1.605 1.605 0 0 1 2.388.086l1.604 1.922V9a1.25 1.25 0 1 1 2.5 0v4.25h2a3 3 0 0 1 3 3v3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.75 10.25V10a5.25 5.25 0 1 1 10.5 0v.25"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
