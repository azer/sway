interface Logger {
  info: (msg, ...props: any[]) => void
  error: (msg, ...props: any[]) => void
}

let c = 0
const colors = ['red', 'blue', 'green', 'purple', 'orange']

export function logger(name: string): Logger {
  const color = colors[c++ % colors.length]

  return {
    info,
    error,
  }

  function info(msg: string, ...props: any[]) {
    log(console.info, msg, props)
  }

  function error(msg: string, ...props: any[]) {
    log(console.error, msg, props)
  }

  function log(
    fn: (msg: string, props: any[]) => void,
    msg: string,
    props: any[]
  ) {
    const args: any[] = [
      `%c<${name}>%c ${msg}`,
      `color: ${color};font-weight: bold;`,
      'color: inherit',
    ]

    if (props.length > 1) {
      args.push(...props.slice(0, -1))
      args.push(props[props.length - 1])
    } else if (props.length > 0) {
      args.push(props[0])
    }

    // @ts-ignore
    fn.apply(console, args)
  }
}

export default logger
