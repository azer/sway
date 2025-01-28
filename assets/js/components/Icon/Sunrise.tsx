import * as React from 'react'

export function SunriseIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="m9.25 16.25-.687-.75a4.25 4.25 0 1 1 6.875 0l-.688.75M4.74 16.25h14.51M6.74 19.25h10.51M12 4.75v.5M15.625 5.721l-.25.433M18.279 8.375l-.433.25M19.25 12h-.5M5.25 12h-.5M6.154 8.625l-.433-.25M8.625 6.154l-.25-.433"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
