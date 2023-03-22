import { styled } from 'themes'
import {
  Command,
  CommandType,
  ModalProps,
  Palette,
  useCommandPalette,
} from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import selectors from 'selectors'
import React, { useEffect, useRef, useState } from 'react'
import { useUserSocket } from 'features/UserSocket'
import { useDispatch, useSelector } from 'state'
import { logger } from 'lib/log'

const dialogId = 'invite-people'
const nameDialogId = 'invite-name'
const emailDialogId = 'invite-email'
const roleDialogId = 'invite-role'

const log = logger('invite-people')
const emailRegex = /^[0-9a-z-_\.\+]+@[a-z-_\.\d]+\.[a-z-_0-9]+$/

export function useInvitePeople() {
  const dispatch = useDispatch()
  // const [] = useSelector((state) => [  ])

  const { useRegister } = useCommandRegistry()
  const commandPalette = useCommandPalette()
  const { channel } = useUserSocket()

  const role = useRoleDialog()
  const email = useEmailDialog()
  const name = useNameDialog()

  const roleModal = () => role.modal(overviewModal)
  const emailModal = () => email.modal(overviewModal, roleModal)
  const nameModal = () => name.modal(overviewModal, emailModal)

  const [inviteProps, setInviteProps] = useState({
    name: '',
    email: '',
    admin: false,
  })

  const emailValid = validEmail(inviteProps.email)
  const nameValid = inviteProps.name.length > 1

  const [localUserId, workspaceId] = useSelector((state) => [
    selectors.users.getSelf(state)?.id,
    selectors.memberships.getSelfMembership(state)?.workspace_id,
  ])

  useEffect(() => {
    if (!commandPalette.isOpen || !commandPalette.id.startsWith('invite-'))
      return

    switch (commandPalette.id) {
      case dialogId:
        commandPalette.setCommands(overviewCommands())
        //commandPalette.setProps(overviewModal(overviewModal))
        break
      case nameDialogId:
        commandPalette.setQuery(inviteProps.name)
        commandPalette.setCommands(name.commands())
        //commandPalette.setProps(nameModal())
        break
      case emailDialogId:
        commandPalette.setQuery(inviteProps.email)
        commandPalette.setCommands(email.commands())
        //commandPalette.setProps(emailModal())
        break
      case roleDialogId:
        commandPalette.setCommands(
          role.commands().map((c) => {
            if (c.id === 'admin' && inviteProps.admin) {
              return {
                ...c,
                icon: 'checkmark',
              }
            } else if (c.id === 'member' && !inviteProps.admin) {
              return {
                ...c,
                icon: 'checkmark',
              }
            }

            return c
          })
        )
        break
    }
  }, [commandPalette.isOpen, commandPalette.id, inviteProps])

  useRegister(
    (register) => {
      register('Invite a member', open, {
        icon: 'avatar',
        type: CommandType.Settings,
        palette: {
          modal: nameModal,
          commands: name.commands,
        },
      })
    },
    [localUserId, workspaceId, channel]
  )

  return {
    modal: nameModal,
    commands: name.commands,
    open,
  }

  function open() {
    commandPalette.open(name.commands(), nameModal())
  }

  function overviewModal(parentModal?: () => ModalProps): ModalProps {
    return {
      id: dialogId,
      title: 'Invite People',
      icon: 'avatar',
      placeholder: 'Ready to send?',
      callback: (id: string | undefined, query: string) => {
        setInviteProps((current) => {
          const invite = {
            invite: {
              email: current.email,
              workspace_id: workspaceId,
              name: current.name,
              created_by_id: localUserId,
            },
          }

          log.info('Sending invite')

          fetch('/api/invites', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(invite),
            headers: {
              'Content-Type': 'application/json',
              // @ts-ignore
              Authorization: `Bearer ${window.initialState.session.jwt}`,
            },
          })
            .then((response) => {
              log.info('Sent invite', response)
              setInviteProps({ name: '', email: '', admin: false })
              commandPalette.close()
            })
            .catch((err) => {
              log.error('err', err)
            })
          return current
        })

        return
      },
      submodalCallback: (
        modalId: string,
        selectedId: string | undefined,
        input: string
      ) => {
        switch (modalId) {
          case 'invite-name':
            setInviteProps((current) => ({ ...current, name: input, step: 1 }))
            break
          case 'invite-email':
            setInviteProps((current) => ({ ...current, email: input, step: 2 }))
            break
          case 'invite-role':
            setInviteProps((current) => ({
              ...current,
              admin: selectedId === 'admin',
              step: 3,
            }))
            break
        }
      },
      parentModal,
    }
  }

  function overviewCommands() {
    const commands: Command[] = [
      {
        id: 'send',
        icon: 'send',
        name: 'Looks good, send it off!',
        hidden: !emailValid || !nameValid,
      },
      {
        id: 'name',
        icon: 'passport',
        name: 'Name:',
        suffix: inviteProps.name,
        error: !nameValid ? 'Needs input' : '',
        palette: {
          modal: () => name.modal(overviewModal),
          commands: name.commands,
        },
      },
      {
        id: 'email',
        icon: 'mail',
        name: 'Email:',
        suffix: inviteProps.email,
        error: !inviteProps.email
          ? 'Needs input'
          : !emailValid
          ? 'Needs correction'
          : '',
        palette: email,
      },
      {
        id: 'role',
        icon: 'new-hire',
        name: 'Role:',
        suffix: inviteProps.admin ? 'Admin' : 'Member',
        palette: role,
      },

      {
        id: 'back',
        icon: 'undo',
        name: 'Back',
        pin: true,
      },
    ]
    return commands
  }
}

export function useNameDialog() {
  const [name, setName] = useState('')

  return {
    modal,
    commands,
  }

  function modal(
    parentModal?: () => ModalProps,
    nextModal?: () => ModalProps
  ): ModalProps {
    return {
      id: nameDialogId,
      title: 'Invite People',
      icon: 'avatar',
      placeholder: 'Enter name of the new teammate',
      parentModal,
      nextModal,
      search: (commands: Command[], query: string) => {
        return commands.map((cmd, ind) => {
          if (cmd.id === 'name') {
            return {
              ...cmd,
              suffix: query,
              hint: '',
            }
          }

          return cmd
        })
      },
    }
  }

  function commands() {
    return [
      {
        id: 'name',
        icon: 'passport',
        name: 'Name:',
        hint: !name ? 'Not set' : '',
        disableClick: true,
      },
      {
        id: 'back',
        value: blur,
        icon: 'undo',
        name: 'Back',
      },
    ]
  }
}

export function useEmailDialog() {
  const dialogId = 'invite-email'

  const [email, setEmail] = useState('')

  return {
    modal,
    commands,
  }

  function modal(
    parentModal?: () => ModalProps,
    nextModal?: () => ModalProps
  ): ModalProps {
    return {
      id: emailDialogId,
      title: 'Invite People',
      icon: 'avatar',
      placeholder: 'Enter email address',
      parentModal,
      nextModal,
      search: (commands: Command[], query: string) => {
        setEmail(query)
        const valid = validEmail(query)

        return commands.map((cmd, ind) => {
          if (cmd.id === 'email') {
            return {
              ...cmd,
              suffix: query,
              hint: valid
                ? 'Looks good'
                : query
                ? 'Needs correction'
                : 'Not set',
            }
          }

          return cmd
        })
      },
    }
  }

  function commands(): Command[] {
    return [
      {
        id: 'email',
        icon: 'mail',
        name: 'Email:',
        suffix: email,
        disableClick: true,
      },
      {
        id: 'back',
        value: blur,
        icon: 'undo',
        name: 'Back',
      },
    ]
  }
}

export function useRoleDialog() {
  const dialogId = 'invite-role'

  return {
    modal,
    commands,
  }

  function modal(parentModal?: () => ModalProps): ModalProps {
    return {
      id: roleDialogId,
      title: 'Invite People',
      icon: 'new-hire',
      selectedId: 'member',
      placeholder: 'Member or admin?',
      parentModal,
    }
  }

  function commands() {
    return [
      {
        id: 'member',
        icon: '',
        name: 'Member',
        hint: '',
      },
      {
        id: 'admin',
        icon: '',
        name: 'Admin',
        hint: 'Can manage workspace',
      },
      {
        id: 'back',
        value: blur,
        icon: 'undo',
        name: 'Back',
      },
    ]
  }
}

function validEmail(email: string) {
  return emailRegex.test(email)
}
