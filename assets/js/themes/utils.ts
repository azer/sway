const BASELINE_UNIT = 4

export const utils = {
  space: (options: {
    inner?: number | number[]
    outer?: number | number[]
    gap?: number
  }) => {
    const ret: { [k: string]: string } = {}

    const margin = options.outer
      ? !Array.isArray(options.outer)
        ? [options.outer]
        : options.outer
      : undefined

    if (margin)
      ret['margin'] = margin.map((n) => `${n * BASELINE_UNIT}px`).join(' ')

    const padding = options.inner
      ? !Array.isArray(options.inner)
        ? [options.inner]
        : options.inner
      : undefined

    if (padding)
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
  round: (radi?: string | boolean) => {
    return {
      borderRadius: radi === undefined || radi === true ? '100%' : `$${radi}`,
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
      overflowY: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    }
  },
  backdrop: (options: {
    blur: number
    saturate: number
    contrast: number
    brightness: number
  }) => {
    return {
      backdropFilter: `blur(${options.blur}px) saturate(${options.saturate}%) contrast(${options.contrast}%) brightness(${options.brightness}%)`,
    }
  },
  fade: (options: { props: string[]; time: number; effect?: string }) => {
    const effect = options.effect || 'ease-in-out'

    return {
      transition: `${options.props.join(' ')} ${options.time}s ${effect}`,
    }
  },
}

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
