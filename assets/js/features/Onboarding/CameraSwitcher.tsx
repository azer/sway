import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { Select } from 'components/Select'
import Icon from 'components/Icon'
import { setVideoInputDeviceId } from 'features/Settings/slice'
import { useDevices } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'

interface Props {}

const log = logger('onboarding/camera-switcher')

export function CameraSwitcher(props: Props) {
  const dispatch = useDispatch()

  const [cameras, selectedCameraId] = useSelector((state) => [
    selectors.settings.allVideoInputDevices(state),
    selectors.settings.getVideoInputDeviceId(state),
  ])

  const { hasCamError, setCamera } = useDevices()

  useEffect(() => {
    log.info('selected camera id changed', selectedCameraId)
    if (selectedCameraId) {
      log.info('Set camera', selectedCameraId)
      setCamera(selectedCameraId)
    }
  }, [selectedCameraId])

  return (
    <Select.Root value={selectedCameraId} onValueChange={handleCameraChange}>
      <Select.Trigger>
        <Select.Value placeholder="Select camera" />
        <Select.Icon asChild>
          <Icon name="chevronDown" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content position="popper" side="bottom" sideOffset={0}>
          <Select.Viewport>
            <Select.Group>
              <Select.Label>Your cameras</Select.Label>
              {cameras.map((device) => (
                <Select.Item key={device.id} value={device.id}>
                  <Select.ItemText>{device.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )

  function handleCameraChange(deviceId: string) {
    dispatch(setVideoInputDeviceId(deviceId))
  }
}
