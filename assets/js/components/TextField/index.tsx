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

export default function TextField(props: Props) {
  const containerEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerEl.current) return
    containerEl.current.dataset.replicatedValue = props.value
  }, [containerEl, props.value])

  return (
    <InputWrapper ref={containerEl}>
      <StyledTextField
        rows={1}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onChange={handleChange}
        ref={props.inputRef}
        placeholder={props.placeholder}
        value={props.value}
      />
    </InputWrapper>
  )

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    props.onInput(e.currentTarget.value)
  }
}

export const InputWrapper = styled('div', {
  display: 'grid',
  backgroundColor: 'transparent',
  '&::after': {
    content: "attr(data-replicated-value) ' '",
    whiteSpace: 'pre-wrap',
    visibility: 'hidden',
    font: 'inherit',
    gridArea: '1 / 1 / 2 / 2',
    lineHeight: 'inherit',
  },
})

export const StyledTextField = styled('textarea', {
  display: 'block',
  width: '100%',
  color: 'rgba(255, 255, 255, 0.9)',
  backgroundColor: 'inherit',
  border: 0,
  fontFamily: '$sans',
  outline: 'none',
  resize: 'none',
  overflow: 'hidden',
  gridArea: '1 / 1 / 2 / 2',
  '&::placeholder': {
    color: 'rgba(103, 107, 122, 1)',
  },
})
