export type EmojiObject = {
  id: string
  name: string
  keywords?: string[]
  skins: {
    unified: string
    native: string
    shortcodes: string
  }[]
  version?: number
  search?: string
}

export const commonEmojis: EmojiObject[] = [
  {
    id: 'headphones',
    name: 'Headphone',
    skins: [
      {
        unified: '1f3a7',
        native: '🎧',
        shortcodes: ':headphones:',
      },
    ],
  },
  {
    id: 'knife_fork_plate',
    name: 'Fork and Knife with Plate',
    skins: [
      {
        unified: '1f37d-fe0f',
        native: '🍽️',
        shortcodes: ':knife_fork_plate:',
      },
    ],
  },
  {
    id: 'date',
    name: 'Calendar',
    skins: [
      {
        unified: '1f4c5',
        native: '📅',
        shortcodes: ':date:',
      },
    ],
  },
  {
    id: 'coffee',
    name: 'Hot Beverage',
    keywords: ['coffee', 'caffeine', 'latte', 'espresso'],
    skins: [
      {
        unified: '2615',
        native: '☕',
        shortcodes: ':coffee:',
      },
    ],
    version: 1,
  },
  {
    id: 'person_in_lotus_position',
    name: 'Person in Lotus Position',
    skins: [
      {
        unified: '1f9d8-1f3fc',
        native: '🧘🏼',
        shortcodes: ':person_in_lotus_position::skin-tone-3:',
      },
    ],
  },
  {
    id: 'house',
    name: 'House',
    skins: [
      {
        unified: '1f3e0',
        native: '🏠',
        shortcodes: ':house:',
      },
    ],
  },
  {
    id: 'sandwich',
    name: 'Sandwich',
    skins: [
      {
        unified: '1f96a',
        native: '🥪',
        shortcodes: ':sandwich:',
      },
    ],
  },
  {
    id: 'face_with_thermometer',
    name: 'Face with Thermometer',
    skins: [
      {
        unified: '1f912',
        native: '🤒',
        shortcodes: ':face_with_thermometer:',
      },
    ],
  },

  {
    id: 'partying_face',
    name: 'Partying Face',
    skins: [
      {
        unified: '1f973',
        native: '🥳',
        shortcodes: ':partying_face:',
      },
    ],
  },
  {
    id: 'yawning_face',
    name: 'Yawning Face',
    skins: [
      {
        unified: '1f971',
        native: '🥱',
        shortcodes: ':yawning_face:',
      },
    ],
  },
]
