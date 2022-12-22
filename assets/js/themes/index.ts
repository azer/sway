import { createStitches } from '@stitches/react'
import { dark } from './colors'

const BASELINE_UNIT = 4

export const { styled, css, theme } = createStitches({
  theme: {
    colors: dark,
    space: {
      space1: '2px',
      space2: '4px',
      space3: '6px',
      space4: '8px',
      space5: '12px',
      space6: '16px',
      space7: '20px',
      space8: '24px',
      space9: '36px',
      space10: '40px',
      space11: '48px',
      space12: '64px',
    },
    fontSizes: {
      xsmall: '10px',
      small: '12px',
      base: '14px',
      medium: '16px',
      large: '21px',
      xlarge: '36px',
    },
    fonts: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    lineHeights: {
      base: '1',
      tight: '1.33',
      normal: '1.5',
      relaxed: '1.71',
      loose: '2',
    },
    letterSpacings: {
      tight: '-0.2px',
      normal: '0',
      wide: '0.2px',
    },
    borderWidths: {},
    borderStyles: {},
    radii: {
      none: 0,
      xsmall: '2px',
      small: '4px',
      medium: '6px',
      large: '12px',
      xlarge: '24px',
      circle: '100%',
    },
    shadows: {},
    zIndices: {
      base: 10,
      aboveBase: 20,
      content: 30,
      aboveContent: 35,
      navigation: 40,
      aboveNavigation: 45,
      modal: 60,
      aboveModal: 65,
      overlay: 90,
      aboveOverlay: 95,
      window: 100,
    },
    transitions: {},
  },
  utils: {
    space: (options: {
      inner?: number | number[]
      outer?: number | number[]
      gap?: number
    }) => {
      const ret: { [k: string]: string } = {}

      const margin = !Array.isArray(options.outer)
        ? [options.outer]
        : options.outer

      if (options.outer)
        ret['margin'] = margin.map((n) => `${n * BASELINE_UNIT}px`).join(' ')

      const padding = !Array.isArray(options.inner)
        ? [options.inner]
        : options.inner

      if (options.inner)
        ret['padding'] = padding.map((n) => `${n * BASELINE_UNIT}px`).join(' ')

      if (options.gap) ret['gap'] = `${options.gap * BASELINE_UNIT}px`

      return ret
    },
    colors: (options: {
      fg?: string
      bg?: string
      border?: string
      caret?: string
      placeholderBg?: string
      placeholderFg?: string
      selectionBg?: string
      selectionFg?: string
    }) => {
      const ret = mapCSSOptions(options, {
        fg: 'color',
        bg: 'backgroundColor',
        caret: 'caretColor',
        border: 'borderColor',
      })

      if (options.placeholderBg) {
        ret['::placeholder'] = {
          ...(ret['::placeholder'] as object),
          background: options.placeholderBg,
        }
      }

      if (options.placeholderFg) {
        ret['::placeholder'] = {
          ...(ret['::placeholder'] as object),
          color: options.placeholderFg,
        }
      }

      if (options.selectionBg) {
        ret['::selection'] = {
          ...(ret['::selection'] as object),
          color: options.selectionBg,
        }
      }

      if (options.selectionFg) {
        ret['::selection'] = {
          ...(ret['::selection'] as object),
          color: options.selectionFg,
        }
      }

      return ret
    },
    baselineBlock: (span: number) => {
      return {
        display: 'flex',
        alignItems: 'flex-end',
        unitHeight: span,
      }
    },
    baselineGrid: (limit: number) => {
      return {
        display: 'grid',
        gridTemplateRows: `repeat(${limit}, minmax(0, ${BASELINE_UNIT}px))`,
      }
    },
    baselineGridRow: (span: number) => {
      return {
        gridRow: `span ${span} / span ${span}`,
      }
    },
    unitHeight: (units: number) => {
      return {
        height: `${units * BASELINE_UNIT}px`,
      }
    },
    unitWidth: (units: number) => {
      return {
        width: `${units * BASELINE_UNIT}px`,
      }
    },
    baselineFontSize: (tokenName: string) => {
      return {
        fontSize: `$${tokenName}`,
        extendDescender: `var(--fontSizes-${tokenName})`,
        lineHeight: '$base',
      }
    },
    extendDescender: (fontSize: string | number) => {
      return {
        position: 'relative',
        bottom: `calc(${fontSize} * -0.14)`,
      }
    },
    round: (radi?: string) => {
      return {
        borderRadius: radi === undefined ? '100%' : `$${radi}`,
      }
    },
    center: () => {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }
    },
    vcenter: () => {
      return {
        display: 'flex',
        alignItems: 'center',
      }
    },
    hcenter: () => {
      return {
        display: 'flex',
        justifyContent: 'center',
      }
    },
    label: () => {
      return {
        cursor: 'default',
        userSelect: 'none',
      }
    },
    ellipsis: () => {
      return {
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }
    },
  },
})

function mapCSSOptions(
  options: object,
  dict: object
): { [k: string]: string | { [k: string]: string } } {
  const ret: { [k: string]: string } = {}
  for (const key in options) {
    // @ts-ignore
    if (dict[key]) {
      // @ts-ignore
      ret[dict[key]] = options[key]
    }
  }

  return ret
}
