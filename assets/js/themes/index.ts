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
      darkBlue: 'rgb(38, 150, 255)',
      blue: 'rgba(75, 177, 232, 1)',
      turquise: 'rgb(14, 152, 173)',
      purple: 'rgb(155, 129, 188)',
      orange: 'rgb(242, 153, 74)',
      red: 'rgb(235, 87, 87)',
      darkRed: 'rgb(197, 40, 40)',
      darkGreen: 'rgb(15, 120, 60)',
      green: 'rgb(76, 183, 130)',
      yellow: 'rgb(242, 201, 76)',
      shellBg: '$gray1',
      shellFg: 'rgb(255, 255, 255)',
      shellBorderColor: 'rgba(255, 255, 255, 0.075)',
      shellBlur1: 'rgba(15, 100, 222, 0.25)',
      headerFg: 'rgba(255, 255, 255, 0.9)',
      navigationFocusFg: '$white',
      navigationFocusBg: 'rgba(125, 145, 200, 0.08)',
      navigationFg: 'rgba(255, 255, 255, 0.6)',
      navigationBlur2: 'rgba(126, 33, 50, 0.125)',
      navigationBlur1: 'rgba(15, 100, 222, 0.1)',
      statusTrayBg: 'rgba(255,255,255,0.03)',
      statusTrayBorderColor: 'rgba(255, 255, 255, 0.04)',
      statusTrayFg: '$white',
      statusTrayIconBorderColor: '$gray2',
      statusTrayIconReadyBg: '$gray3',
      statusTrayIconConnectingBg: '$yellow',
      statusTrayIconFailedBg: '$red',
      statusTrayIconConnectedBg: 'rgb(20, 130, 80)',
      statusTrayButtonFg: 'rgba(255, 255, 255, 0.3)',
      statusTrayButtonIconFg: 'rgba(255, 255, 255, 0.7)',
      statusTrayButtonBg: 'rgba(255, 255, 255, 0.0185)',
      statusTrayButtonHoverBg: 'rgba(255, 255, 255, 0.02)',
      statusTrayButtonHoverFg: 'rgba(255, 255, 255, 0.6)',
      statusTrayButtonHighlightedBg: 'rgba(255, 255, 255, 0.03)',
      statusTrayButtonLabelFg: 'rgba(255, 255, 255, 0.5)',
      presenceModelineFocusFg: 'rgba(242, 201, 76, 0.9)',
      presenceModelineFocusBlur: 'rgba(242, 201, 76, 0.2)',
      presenceModelineAwayFg: 'rgba(255, 93, 224, 0.9)',
      presenceModelineAwayBlur: 'rgba(255, 93, 224, 0.12)',
      presenceModelineDndFg: 'rgba(235, 87, 87, 0.9)',
      presenceModelineDndBlur: 'rgba(235, 87, 87, 0.15)',
      presenceModelineActiveFg: 'rgb(24, 255, 167)',
      presenceModelineActiveBlur: 'rgba(24, 255, 167, 0.18)',
      commandPaletteBg: 'rgba(30, 34, 41, 0.6)', //rgba(29, 30, 43, 0.498)',
      commandPaletteFg: '$white',
      commandPaletteTitleFg: 'rgba(255, 255, 255, 0.6)',
      commandPaletteTitleBg: 'rgba(255, 255, 255, 0.08)',
      commandPaletteHeaderBorderColor: 'rgba(255, 255, 255, 0.1)',
      commandPaletteInputFg: '$white',
      commandPaletteCaretColor: 'rgba(38, 181, 206, 0.95)',
      commandPalettePlaceholderFg: 'rgba(255, 255, 255, 0.4)',
      commandPaletteCommandFg: 'rgba(255, 255, 255, 0.4)',
      commandPaletteCommandIconFg: 'rgba(255, 255, 255, 0.3)',
      commandPaletteSelectedCommandFg: '$white',
      commandPaletteSelectedCommandIconFg: 'rgba(255, 255, 255, 0.6)',
      commandPaletteSelectedCommandBg: 'rgba(255, 255, 255, 0.05)',
      commandPaletteSelectedCommandBorder: 'rgba(38, 181, 206, 0.9)',
      commandPaletteShortcutBg: 'rgba(149, 149, 189, 0.125)',
      commandPaletteSeparatorBg: 'rgba(255, 255, 255, 0.06)',
      participantUsernameFg: '$white',
      participantUsernameBg: 'rgba(29, 30, 43, 0.498)',
      roomTitleFg: '$white',
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
