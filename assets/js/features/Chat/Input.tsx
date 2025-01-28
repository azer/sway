import { styled } from 'themes'
import React from 'react'
import { TextField, TextfieldInput, TextFieldRoot } from 'components/TextField'

interface Props {
  inputRef: React.RefObject<HTMLTextAreaElement>
  placeholder: string
  focused: boolean
  value: string
  onFocus: () => void
  onBlur: () => void
  onInput: (value: string) => void
  inline: boolean
}

export function ChatInput(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return (
    <StyledChatInput focused={props.focused} inline={props.inline}>

      <TextField
        inputRef={props.inputRef}
        value={props.value}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        onInput={props.onInput}
      />
    </StyledChatInput>
  )
}

export const StyledChatInput = styled('div', {
  lineHeight: '$relaxed',
  fontSize: '$base',
  fontFamily: '$sans',
  color: '$red',
  [`& ${TextFieldRoot}`]: {
    padding: '8px 16px',
    background: '$chatInputBg',
    round: 'medium',
    border: '0.5px solid transparent',
    position: 'relative',
  },
  [`& ${TextfieldInput}`]: {
    color: '$chatInputFg',
    lineHeight: '$relaxed',
    fontSize: '$base',
    caretColor: '$chatInputCaret',
  },
  [`& ${TextFieldRoot}::before`]: {
    position: 'absolute',
    height: '100%',
    content: ' ',
    width: '3.5px',
    background: 'transparent',

    borderBottomLeftRadius: '$medium',
    borderTopLeftRadius: '$medium',
  },
  [`& ${TextFieldRoot}::after`]: {
    fontSize: '$base',
    lineHeight: '$relaxed',
    margin: '2px 0 0 2px',
  },
  variants: {
    focused: {
      true: {
        [`& ${TextFieldRoot}`]: {
          background: '$chatInputFocusBg',
          color: '$chatInputFocusFg',
          borderColor: 'rgba(82, 82, 111, 0.44)',
          boxShadow: 'rgb(1 4 12 / 50%) 0px 0px 15px',
        },

        [`& ${TextFieldRoot}::before`]: {
          background: `$focusItemBg`,
        },
        [`& ${TextfieldInput}`]: {
          color: '$chatInputFocusFg',
        },
      },
    },
    inline: {
      true: {
        [`& ${TextFieldRoot}`]: {
          background: 'rgb(50,54,59)',
        },
        [`& ${TextfieldInput}`]: {
          //color: '$black',
        },
      },
    },
  },
})
