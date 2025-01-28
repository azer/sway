import { styled, theme } from '../themes'

export function Section(props) {
  return (
    <Container>
      <Title>{props.title}</Title>
      {props.desc ? <Desc>{props.desc}</Desc> : null}
      {props.children}
    </Container>
  )
}

export function ColorToken(props) {
  return (
    <ColorExample>
      <header>
        <label>{props.token}</label> {normalize(props.value)}
      </header>
      <div style={{ backgroundColor: props.value }}></div>
    </ColorExample>
  )

  function normalize(value) {
    if (value.startsWith('var(--colors-')) {
      return 'base:' + value.replace('var(--colors-', '').slice(0, -1)
    }

    return value
  }
}

export function SpaceToken(props) {
  return (
    <SpaceExample>
      <header>
        <label>{props.token}</label> {props.value}
      </header>
      <section>
        <div className="left" style={{ paddingLeft: props.value }}>
          <span>{props.value}</span>
        </div>
        <div className="top" style={{ paddingTop: props.value }}>
          <span>{props.value}</span>
        </div>
      </section>
    </SpaceExample>
  )
}

export function RadiusToken(props) {
  return (
    <RadiusExample>
      <header>
        <label>{props.token}</label> {props.value}
      </header>
      <section>
        <div style={{ borderRadius: props.value }}>{props.value}</div>
      </section>
    </RadiusExample>
  )
}

export function TypoToken(props) {
  const css = {}
  css[props.cssProp] = props.value

  return (
    <TypoExample css={css}>
      <header>
        <label>{props.token}:</label> {props.value}
      </header>
      {props.children}
    </TypoExample>
  )
}

export function ZIndexToken(props) {
  return (
    <ZIndexExample>
      <header>
        <label>{props.token}:</label> {props.value}
      </header>
    </ZIndexExample>
  )
}

const Container = styled('section', {
  font: '14px $sans',
  margin: '40px 0 15px 0',
  padding: '0 0 15px 0',
  '& header, & section div span': {
    fontWeight: '$normal',
    fontSize: '$small',
  },
  '& header': {
    color: 'rgba(0,0,0,0.5)',
    fontSize: '$small',
  },
  '& header label': {
    display: 'block',
    color: 'rgba(0,0,0,0.8)',
    fontSize: '14px',
  },
})

const Title = styled('div', {
  fontSize: '24px',
  marginBottom: '15px',
  color: 'rgba(0,0,0,.95)',
  textTransform: 'capitalize',
})

const Desc = styled('div', {
  fontSize: '16px',
  marginTop: '-10px',
  marginBottom: '20px',
  color: 'rgba(0,0,0,0.5)',
})

const SpaceExample = styled('div', {
  display: 'grid',
  padding: '8px 16px',
  margin: '8px 0 20px 0',
  gridTemplateColumns: '100px auto',
  borderLeft: '6px solid rgba(0,0,0,0.07)',
  width: '400px',
  height: '150px',
  '& header': {
    height: '100%',
  },
  '& section': {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '6px',
  },
  '& section div': {
    position: 'absolute',
    top: 'calc(50% - 25px)',
    left: 0,
    backgroundColor: '#c084fc1a',
    backgroundSize: '7.07px 7.07px',
    backgroundImage:
      'linear-gradient(135deg,#a855f780 10%,transparent 0,transparent 50%,#a855f780 0,#a855f780 60%,transparent 0,transparent)',
    width: '50px',
    height: '50px',
    borderRadius: '6px',
  },
  '& section div span': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    width: '50px',
    height: '50px',
    background: 'rgb(168, 85, 247)',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  '& section .top': {
    top: '0',
    left: 'calc(50% - 25px)',
  },
})

const RadiusExample = styled('div', {
  display: 'grid',
  padding: '8px 16px',
  margin: '8px 0 20px 0',
  gridTemplateColumns: '1fr 1``',
  borderLeft: '6px solid rgba(0,0,0,0.07)',
  width: '400px',
  height: '150px',
  '& header': {
    height: '100%',
  },
  '& section': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '6px',
  },
  '& section div': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    width: '100px',
    height: '100px',
    background: 'rgb(168, 85, 247)',
    color: 'rgba(255, 255, 255, 0.8)',
  },
})

const ColorExample = styled('div', {
  display: 'grid',
  padding: '8px 16px',
  margin: '8px 0 20px 0',
  gridTemplateColumns: 'auto 100px',
  borderLeft: '6px solid rgba(0,0,0,0.07)',
  width: '400px',
  height: '100px',
  '& header': {
    background: '#fff',
    height: '100%',
  },
  '& div': {
    borderRadius: '2px',
    border: '1px solid rgba(0,0,0,0.07)',
  },
})

export const TypoExample = styled('div', {
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '1',
  color: 'rgba(0,0,0,.95)',
  borderLeft: '6px solid rgba(0,0,0,0.07)',
  padding: '8px 20px',
  margin: '14px 0',
  fontFamily: '$sans',
  '& header': {
    margin: '0 0 20px 0',
    '& label': {
      color: 'rgba(0,0,0,0.7)',
      display: 'inline',
      fontSize: '12px',
    },
  },
})

export const ZIndexExample = styled('div', {
  fontSize: '14px',
  fontWeight: '400',
  lineHeight: '1',
  color: 'rgba(0,0,0,.95)',
  borderLeft: '6px solid rgba(0,0,0,0.07)',
  padding: '8px 20px',
  margin: '14px 0',
  fontFamily: '$sans',
  '& header': {
    margin: '0',
    fontSize: '14px',
    '& label': {
      color: 'rgba(0,0,0,0.7)',
      display: 'inline',
    },
  },
})

export function colors() {
  const categories = {
    primary: [],
    base: [],
    shell: [],
    navigation: [],
  }

  const all = theme.colors

  for (const color in all) {
    let found = undefined

    for (const cat in categories) {
      if (color === 'primary') {
        found = 'primary'
        break
      }

      if (cat === 'base' || cat === 'primary') continue

      if (cat !== 'base' && all[color]?.token.startsWith(cat)) {
        found = cat
        break
      }
    }

    if (!found) {
      for (const cat in categories) {
        if (cat === 'base' || cat === 'primary') continue

        if (
          all[color]?.token.includes(
            cat.slice(0, 1).toUpperCase() + cat.slice(1)
          )
        ) {
          found = cat
          break
        }
      }
    }

    categories[found || 'base'].push({
      value: all[color].value,
      token: all[color].token,
    })
  }

  return categories
}
