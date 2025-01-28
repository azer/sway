import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { Slider } from 'components/Slider'
import { Title } from 'components/Onboarding'
import { useSelector, useDispatch } from 'state'
import { setBackgroundBlur } from 'features/Settings/slice'
import { useDaily } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'

const log = logger('onboarding/blur-slider')

interface Props {}

export function BlurSlider(props: Props) {
  const dispatch = useDispatch()
  const call = useDaily()

  const [blur] = useSelector((state) => [
    selectors.settings.getBackgroundBlurValue(state),
  ])
  const timer = useRef<NodeJS.Timer | null>(null)

  useEffect(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    } else if (call) {
      setDailyBlur(blur)
      timer.current = setTimeout(() => {}, 1000)
      return
    }

    timer.current = setTimeout(() => {
      setDailyBlur(blur)
    }, 1000)
  }, [blur])

  return (
    <>
      <Title>
        <label>Blur</label>
      </Title>
      <Slider.Root
        defaultValue={[blur]}
        max={100}
        step={10}
        onValueChange={handleBlurChange}
      >
        <Slider.Track>
          <Slider.Range />
          <Slider.Label right>{blur !== 0 ? `${blur}%` : 'Off'}</Slider.Label>
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Root>
    </>
  )

  function handleBlurChange(n: number[]) {
    dispatch(setBackgroundBlur(n[0]))
  }

  function setDailyBlur(strength: number) {
    if (!call) return

    log.info('Set daily blur strength:', strength)

    call.updateInputSettings({
      video: {
        processor:
          blur === 0
            ? { type: 'none' }
            : {
                type: 'background-blur',
                config: { strength: strength / 100 },
              },
      },
    })
  }
}
