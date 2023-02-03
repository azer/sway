import React from 'react'
import Headphones from './Headphones'
import Coffee from './Coffee'
import PhoneCall from './PhoneCall'
import Night from './Night'
import Sliders from './Sliders'
import Terminal from './Terminal'
import Command from './Command'
import MicIcon from './Mic'
import VideoIcon from './Video'
import MonitorIcon from './Monitor'
import SpeakerIcon from './Speaker'
import MicOffIcon from './Mic-off'
import VideoOffIcon from './Video-off'
import { logger } from 'lib/log'
import CheckmarkIcon from './Checkmark'
import Undo from './Undo'
import SpeakerVolumeHigh from './SpeakerVolumeHigh'
import SpeakerOff from './SpeakerOff'
import ProjectorIcon from './Projector'
import { PressIcon } from './Press'
import { DotsIcon } from './Dots'
import { AirpodsIcon } from './Airpods'
import { ZoomInIcon, ZoomOutIcon } from './Zoom'
import { EyeIcon } from './Eye'
import { SunriseIcon } from './Sunrise'
import { IncognitoIcon } from './Incognito'
import { LiveStreamIcon } from './Livestream'
import { PlusIcon } from './Plus'
import { HashtagIcon } from './Hashtag'
import { EditIcon } from './Edit'
import { TrashIcon } from './Trash'
import { LogoutIcon } from './Logout'
import { AvatarIcon } from './Avatar'
import { MailIcon } from './Mail'
import { PassportIcon } from './Passport'
import { NewHireIcon } from './NewHire'
import { SendIcon } from './Send'
import { LightBulbIcon } from './LightBulb'

const icons: {
  [k: string]: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
} = {
  headphones: Headphones,
  coffee: Coffee,
  phoneCall: PhoneCall,
  night: Night,
  sliders: Sliders,
  terminal: Terminal,
  checkmark: CheckmarkIcon,
  command: Command,
  mic: MicIcon,
  video: VideoIcon,
  micOff: MicOffIcon,
  videoOff: VideoOffIcon,
  monitor: MonitorIcon,
  speaker: SpeakerIcon,
  speakerVolumeHigh: SpeakerVolumeHigh,
  speakerOff: SpeakerOff,
  airpods: AirpodsIcon,
  projector: ProjectorIcon,
  undo: Undo,
  press: PressIcon,
  dots: DotsIcon,
  zoomIn: ZoomInIcon,
  zoomOut: ZoomOutIcon,
  eye: EyeIcon,
  sunrise: SunriseIcon,
  incognito: IncognitoIcon,
  livestream: LiveStreamIcon,
  plus: PlusIcon,
  hashtag: HashtagIcon,
  edit: EditIcon,
  trash: TrashIcon,
  logout: LogoutIcon,
  avatar: AvatarIcon,
  mail: MailIcon,
  passport: PassportIcon,
  newHire: NewHireIcon,
  send: SendIcon,
  lightbulb: LightBulbIcon,
}

interface Props extends React.SVGProps<SVGSVGElement> {
  name: string
}

const log = logger('icons')

export default function Icon(props: Props) {
  if (!props.name) return <></>

  const IconComponent =
    icons[props.name] ||
    icons[
      props.name.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase()
      })
    ]
  if (IconComponent) {
    return <IconComponent {...props} />
  } else {
    log.error('Can not find icon', props.name, Object.keys(icons))
  }

  return <></>
}
