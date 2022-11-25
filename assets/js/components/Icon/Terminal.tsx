import * as React from 'react'

export default function Terminal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      stroke="currentColor"
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m4 17 6-6-6-6M12 19h8" />
    </svg>
  )
}
