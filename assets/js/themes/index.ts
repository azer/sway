import { createStitches } from '@stitches/react'
import { tokens } from './tokens'
import { utils } from './utils'

export const { styled, css, theme } = createStitches({
  media: {
    mobile: '(max-width: 399px)',
    xs: '(min-width: 640px) and (min-height: 399px)',
    s: '(min-width: 800px) and (max-width: 899px)',
    m: '(min-width: 1024px) and (min-height: 599px)',
    l: '(min-width: 1200px) and (min-height: 700px)',
    xl: '(min-width: 1600px) and (min-height: 1000px)',
  },
  theme: tokens,
  utils,
})
