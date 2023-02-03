import * as React from 'react'

export function LightBulbIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12 4.75C8.5 4.75 6.75 7.5 6.75 10c0 4 3 4.5 3 6v2.25a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V16c0-1.5 3-2 3-6 0-2.5-1.75-5.25-5.25-5.25ZM10 16.75h4"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
