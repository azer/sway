import * as React from 'react'

export default function SpeakerVolumeHigh(
  props: React.SVGProps<SVGSVGElement>
) {
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
        d="M15.75 10.75s.5.484.5 1.25-.5 1.25-.5 1.25M17.75 7.75s1.5 1.25 1.5 4.249c0 2.998-1.5 4.25-1.5 4.25M13.25 4.75l-4.75 4H5.75a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1H8.5l4.75 4V4.75Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
