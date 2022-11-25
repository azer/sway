import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { useHotkeys } from 'react-hotkeys-hook'

export default function useCommandK() {
  const { search, commands } = useCommandRegistry()
  const { open } = useCommandPalette()

  console.log('cmd k')
  useHotkeys('cmd+k', onPressCommandK, {
    enableOnFormTags: true,
  })

  function onPressCommandK() {
    console.log('cmdaa k')

    open({
      title: 'Bafa Command',
      icon: 'command',
      placeholder: 'Enter a command',
      search,
      callback: (selectedCommandId: string | undefined, query: string) => {
        if (!selectedCommandId) return

        const cmd = commands[selectedCommandId]
        if (!cmd || !cmd.callback) return

        cmd.callback(query)
      },
    })
  }
}
