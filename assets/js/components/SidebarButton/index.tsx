import { styled } from 'themes'

export const SidebarButtonset = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const SidebarButton = styled('div', {
  round: 'medium',
  color: 'rgba(225, 245, 255, 0.7)',
  height: '38px',
  position: 'relative',
  vcenter: true,
  label: true,
  [`& svg`]: {
    width: '12px',
    height: '12px',
    marginRight: '8px',
    opacity: '0.55',
  },
  '& em-emoji': {
    marginRight: '8px',
  },
  '&::before': {
    content: ' ',
    width: 'calc(100% + 24px)',
    height: '100%',
    position: 'absolute',
    left: '-12px',
    round: 'medium',
    background: 'rgba(225, 235, 255, 0.04)',
  },
  '&:hover': {
    color: '$white',
    '&::before': {
      background: 'rgba(225, 235, 255, 0.08)',
    },
    '& svg': {
      color: '$candy',
      opacity: '1',
    },
  },
})

export const Title = styled('h1', {
  fontSize: '13px',
  fontWeight: '$medium',
  color: '$gray8',
  margin: '21px 0 12px',
  vcenter: true,
  label: true,
  '& label': {
    color: '$gray4',
    fontSize: '$small',
    marginTop: '1px',
    marginLeft: '4px',
    position: 'relative',
  },
})
