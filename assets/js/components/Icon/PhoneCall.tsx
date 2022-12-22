import * as React from 'react'

export default function PhoneCallIcon(props: React.SVGProps<SVGSVGElement>) {
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
        d="M8.893 4.75H6.068c-.728 0-1.318.59-1.318 1.318 0 7.28 5.902 13.182 13.182 13.182.728 0 1.318-.59 1.318-1.318v-2.825l-3.107-2.071-1.611 1.61c-.28.28-.698.368-1.05.186a11.093 11.093 0 0 1-2.518-1.796 8.726 8.726 0 0 1-1.836-2.542c-.16-.34-.067-.733.199-1l1.637-1.637L8.893 4.75ZM14 5.03a7.264 7.264 0 0 1 5 5.076"
      />
    </svg>
  )
}
