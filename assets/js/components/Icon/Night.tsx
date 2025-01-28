import * as React from 'react'

export default function NightIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M18.25 15.031a6.876 6.876 0 0 1-1.53.172c-3.912 0-7.084-3.284-7.084-7.336 0-1.114.24-2.171.67-3.117-3.178.724-5.556 3.657-5.556 7.164 0 4.052 3.172 7.336 7.085 7.336 2.836 0 5.283-1.726 6.415-4.219Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
