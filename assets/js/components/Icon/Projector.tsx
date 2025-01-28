import * as React from 'react'

export default function ProjectorIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M18.25 7.75H5.75v7.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-7.5ZM18.25 4.75H5.75a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h12.5a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1ZM12 17.5v1.75"
      />
    </svg>
  )
}
