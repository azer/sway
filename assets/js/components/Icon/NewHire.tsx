import * as React from 'react'

export function NewHireIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M6.75 19.25s1.575-2.5 5.25-2.5 5.25 2.5 5.25 2.5M12 4.75v.5m3.625.471-.25.433m2.904 2.22-.433.25M19.25 12h-.5m-.471 3.625-.433-.25m-11.692 0-.433.25M5.25 12h-.5m1.404-3.375-.433-.25m2.904-2.22-.25-.434M14.25 12a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
      />
    </svg>
  )
}
