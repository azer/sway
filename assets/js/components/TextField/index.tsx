import { styled } from '@stitches/react'
import React, { useEffect, useRef } from 'react'

interface Props {
  placeholder: string
  inputRef: React.RefObject<HTMLTextAreaElement>
  onInput: (value: string) => void
  value: string
  onFocus: () => void
  onBlur: () => void
}

export function TextField(props: Props) {
  const containerEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerEl.current) return
    containerEl.current.dataset.replicatedValue = props.value
  }, [containerEl, props.value])

  return (
    <TextFieldRoot ref={containerEl}>
      <TextfieldInput
        rows={1}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onChange={handleChange}
        ref={props.inputRef}
        placeholder={props.placeholder}
        value={props.value}
      />
    </TextFieldRoot>
  )

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.onInput(e.currentTarget.value)
  }
}

export const TextFieldRoot = styled('div', {
  display: 'grid',
  backgroundColor: 'transparent',
  '&::after': {
    content: "attr(data-replicated-value) ' '",
    whiteSpace: 'pre-wrap',
    visibility: 'hidden',
    font: 'inherit',
    gridArea: '1 / 1 / 2 / 2',
    lineHeight: 'inherit',
    color: '$blue',
  },
})

export const TextfieldInput = styled('textarea', {
  display: 'block',
  width: '100%',
  color: 'rgba(255, 255, 255, 0.9)',
  backgroundColor: 'transparent',
  border: 0,
  fontFamily: 'inherit',
  outline: 'none',
  resize: 'none',
  lineHeight: 'inherit',
  overflow: 'hidden',
  gridArea: '1 / 1 / 2 / 2',
  '&::placeholder': {
    color: 'rgba(103, 107, 122, 1)',
  },
})
