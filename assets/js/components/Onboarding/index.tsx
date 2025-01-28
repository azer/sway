import { styled } from 'themes'

export const StepGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '60% 40%',
  alignItems: 'center',
  height: '100%',
  padding: '90px',
  gap: '24px',
})

export const StepTitle = styled('h1', {
  fontSize: '48px',
  fontWeight: '$bold',
  margin: '12px 0',
  color: '$gray2',
  lineHeight: '$base',
})

export const StepDesc = styled('div', {
  fontSize: '$medium',
  lineHeight: '$normal',
  color: '$gray3',
  maxWidth: '400px',
})

export const StepSection = styled('div', {
  minHeight: '60%',
  variants: {
    fill: {
      true: {
        height: '100%',
      },
    },
  },
})

export const StepContent = styled('div', {
  height: '100%',
})

export const Title = styled('div', {
  margin: '8px 0px -4px 0',
  fontSize: '$small',
  fontWeight: '$medium',
  color: '$gray3',
  '& label': {
    //borderRadius: '$small',
    //background: 'rgba(0, 0, 0, 0.06)',
    //padding: '4px 8px',
  },
})
