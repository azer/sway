import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { Title } from 'components/Onboarding'
import { useDaily } from '@daily-co/daily-react-hooks'
// import { useSelector, useDispatch } from 'state'

const colors = [
  'rgb(172, 218, 207)',
  'rgb(239, 123, 136)',
  'rgb(255, 164, 0)',
  'rgb(155, 231, 248)',
  'rgb(0, 196, 126)',
  'rgb(243, 181, 210)',
  'rgb(255, 235, 66)',
  'rgb(255, 70, 20)',
  'rgb(160, 233, 197)',
  'rgb(253, 230, 231)',
  'rgb(222, 217, 249)',
  'rgb(254, 205, 109)',
]

const files: Record<string, string> = {
  'rgb(172, 218, 207)': 'https://cldup.com/7Fq680OKfF.png',
  'rgb(239, 123, 136)': 'https://cldup.com/4_WL56nmhY.png',
  'rgb(255, 164, 0)': 'https://cldup.com/vbxwgUywCO.png',
  'rgb(155, 231, 248)': 'https://cldup.com/FV9o6XKqE8.png',
  'rgb(0, 196, 126)': 'https://cldup.com/CFyn5hQ9fE.png',
  'rgb(243, 181, 210)': 'https://cldup.com/Bdau53vye8.png',
  'rgb(255, 235, 66)': 'https://cldup.com/h569MDXnPN.png',
  'rgb(255, 70, 20)': 'https://cldup.com/YHxAssIeK9.png',
  'rgb(160, 233, 197)': 'https://cldup.com/EHd7HMSHRJ.png',
  'rgb(253, 230, 231)': 'https://cldup.com/CHHUJcd2Yr.png',
  'rgb(222, 217, 249)': 'https://cldup.com/-f_UOQSJth.png',
  'rgb(254, 205, 109)': 'https://cldup.com/8JUG5vMaxL.png',
}

interface Props {}

export function BackgroundSelector(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  //useEffect(() => {}, [])
  const call = useDaily()

  return (
    <>
      <Title>
        <label>Background</label>
      </Title>
      <Container>
        <Color onClick={reset} />
        {colors.map((c) => (
          <Color onClick={() => handleColorSelect(c)} css={{ background: c }} />
        ))}
      </Container>
    </>
  )

  function reset() {
    call?.updateInputSettings({
      video: {
        processor: {
          type: 'none',
        },
      },
    })
  }

  function handleColorSelect(color: string) {
    if (!files[color]) return reset()

    call?.updateInputSettings({
      video: {
        processor: {
          type: 'background-image',
          config: {
            source: files[color],
          },
        },
      },
    })
  }
}

const Container = styled('div', {
  display: 'flex',
  gap: '4px',
  overflow: 'hidden',
})

const Color = styled('div', {
  flexShrink: '0',
  width: '24px',
  height: '24px',
  border: '2px solid rgba(0,0,0,0.1)',
  round: true,
})
