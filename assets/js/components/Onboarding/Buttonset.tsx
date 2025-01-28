import React from 'react'
import Icon from 'components/Icon'
import { styled } from 'themes'

interface Props {
  label: string
  done: () => void
  back?: () => void
  skip?: () => void
  skipLabel?: string
}

export function OnboardingButtonset(props: Props) {
  return (
    <StepButtonset column={!!props.skip}>
      {props.back ? (
        <StepButton onClick={props.back} secondary>
          <Icon name="arrowLeft" />
        </StepButton>
      ) : null}
      <StepButton onClick={props.done}>
        {props.label} <Icon name="arrowRight" />
      </StepButton>
      {props.skip ? (
        <StepButton onClick={props.skip} secondary skip>
          {props.skipLabel}
        </StepButton>
      ) : null}
    </StepButtonset>
  )
}

export const StepButtonset = styled('div', {
  display: 'flex',
  cursor: 'default',
  marginTop: '48px',
  gap: '12px',
})

export const StepButton = styled('div', {
  background: '$black',
  color: '$white',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '16px 36px',
  borderRadius: '$large',
  fontSize: '$medium',
  fontWeight: '$semibold',
  cursor: 'default',
  boxShadow: '#00000017 0 1px 1px',
  transition: 'transform .2s',
  '&:hover': {
    background: '$gray2',
    transform: 'translateY(-2px)',
  },
  svg: {
    display: 'inline-block',
    position: 'relative',
    height: '16px',
    width: '16px',
    marginLeft: '20px',
  },
  variants: {
    secondary: {
      true: {
        background: 'transparent',
        border: '1px solid rgb(220, 220, 220)',
        color: 'rgb(150, 150, 150)',
        boxShadow: 'none',
        padding: '16px 20px',
        '& svg': {
          margin: '0',
        },
        '&:hover': {
          background: 'rgb(245, 245, 245)',
          color: 'rgb(120, 120, 120)',
        },
      },
    },
    skip: {
      true: {
        border: '0',
        color: 'rgb(120, 120, 120)',
        padding: '16px 8px',
        transition: 'transform .2s',
        '&:hover': {
          color: 'rgb(90, 90, 90)',
          background: 'transparent',
          transform: 'translateY(0)',
          cursor: 'pointer',
        },
      },
    },
  },
})
