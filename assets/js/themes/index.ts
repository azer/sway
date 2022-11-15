import { createStitches } from '@stitches/react'

const BASELINE_UNIT = 4

export const { styled, css, theme } = createStitches({
  theme: {
    colors: {
      black: 'rgba(0,0,0,0.95)',
      gray1: 'rgb(20, 22, 26)',
      gray2: 'rgb(30, 34, 41)', //'rgb(36, 36, 44)',
      gray3: 'rgb(65, 65, 65)',
      gray4: 'rgb(72, 83, 94)',
      gray9: 'rgb(145, 145, 149)',
      silver: 'rgb(198, 203, 209)',
      white: 'rgba(255, 255, 255, 0.95)',
      teal: 'rgb(38, 181, 206)',
      lightBlue: 'rgba(100, 198, 251, 1)',
      blue: 'rgb(38, 150, 255)',
      darkBlue: 'rgba(75, 177, 232, 1)',
      turquise: 'rgb(14, 152, 173)',
      purple: 'rgb(155, 129, 188)',
      orange: 'rgb(242, 153, 74)',
      red: 'rgb(235, 87, 87)',
      darkRed: 'rgb(197, 40, 40)',
      green: 'rgb(15, 120, 60)',
      darkGreen: 'rgb(76, 183, 130)',
      yellow: 'rgb(242, 201, 76)',
      shellBg: '$gray1',
      shellFg: 'rgb(255, 255, 255)',
      shellBorderColor: 'rgba(255, 255, 255, 0.075)',
    },
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
      small: '12px',
      base: '14px',
      large: '16px',
      xlarge: '21px',
      xxlarge: '36px',
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
      xs: '2px',
      s: '3px',
      m: '4px',
      l: '6px',
      xl: '8px',
      xxl: '12px',
      xxxl: '20px',
      full: '100%',
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
      aboveModel: 65,
      overlay: 90,
      aboveOverlay: 95,
      window: 100,
    },
    transitions: {},
  },
  utils: {
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
        bottom: `calc(${fontSize} * -0.22)`,
      }
    },
  },
})
