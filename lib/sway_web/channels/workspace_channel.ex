defmodule SwayWeb.WorkspaceChannel do
  use SwayWeb, :channel

  alias SwayWeb.UserPresence

  @impl true
  def join("workspace:" <> workspace_id, _payload, socket) do
    if authorized?(socket.assigns.user, SwayWeb.Hashing.decode_workspace(workspace_id)) do
      send(self(), :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    user = Sway.Accounts.get_user!(socket.assigns[:user])
    id = SwayWeb.Hashing.encode_user(user.id)

    {:ok, _} =
      UserPresence.track(socket, "users:#{id}", %{
        user_id: id,
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", UserPresence.list(socket))

    {:noreply, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  def handle_in("entities:fetch", %{"id" => encoded_id, "schema" => schema_name}, socket) do
    {key, schema, view} = SwayWeb.SchemaMap.find_by_name(schema_name)
    row = Sway.Repo.get!(schema, SwayWeb.Hashing.decode_any(encoded_id))
    {:reply, {:ok, SwayWeb.APIView.render_row(view.encode(row), key)}, socket}
  end

  def handle_in(
        "users:tap",
        %{
          "from" => tapping_user_id,
          "to" => tapped_user_id,
          "room_id" => room_id,
          "workspace_id" => workspace_id
        },
        socket
      ) do
    broadcast(socket, "users:tap", %{
      "from" => tapping_user_id,
      "to" => tapped_user_id,
      "workspace_id" => workspace_id,
      "room_id" => room_id
    })
  end

  def handle_in("workspace:list_online_users", %{"workspace_id" => workspace_id}, socket) do
    statuses =
      list_online_users_by_rooms(socket, SwayWeb.Hashing.decode_workspace(workspace_id))
      |> Enum.map(fn status -> status_broadcastable(status) end)

    {:reply, {:ok, %{statuses: statuses}}, socket}
  end

  def handle_in("workspace:list_workspace_memberships", %{"workspace_id" => workspace_id}, socket) do
    memberships =
      Sway.Workspaces.list_memberships_by_workspace(
        SwayWeb.Hashing.decode_workspace(workspace_id)
      )

    {:reply,
     {:ok, Enum.map(memberships, fn membership -> membership_broadcastable(membership) end)},
     socket}
  end

  def handle_in(
        "rooms:join",
        %{"id" => encoded_room_id, "workspace_id" => encoded_workspace_id},
        socket
      ) do
    room_id = SwayWeb.Hashing.decode_room(encoded_room_id)
    workspace_id = SwayWeb.Hashing.decode_workspace(encoded_workspace_id)
    encoded_user_id = SwayWeb.Hashing.encode_user(socket.assigns.user)

    broadcast(socket, "rooms:join", %{"id" => encoded_room_id, "user_id" => encoded_user_id})

    {:ok, _} =
      UserPresence.update(socket, "users:#{encoded_user_id}", %{
        user_id: encoded_user_id,
        online_at: inspect(System.system_time(:second)),
        room_id: encoded_room_id,
        workspace_id: encoded_workspace_id
      })

    status = Sway.Statuses.get_latest_status(socket.assigns.user, workspace_id)

    case Sway.Statuses.update_status(status, %{room_id: room_id}) do
      {:ok, status} ->
        # broadcast(socket, "user:status", status_broadcastable(status))
        broadcast(
          socket,
          "workspace:sync_online_user_statuses",
          %{
            statuses:
              Enum.map(list_online_users_by_rooms(socket, workspace_id), fn status ->
                status_broadcastable(status)
              end)
          }
        )

        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("rooms:create", %{"name" => name, "workspace_id" => encoded_workspace_id}, socket) do
    user = Sway.Accounts.get_user!(socket.assigns.user)
    workspace_id = SwayWeb.Hashing.decode_workspace(encoded_workspace_id)

    attrs = %{
      name: name,
      slug: Slug.slugify(name),
      workspace_id: workspace_id,
      user_id: socket.assigns.user,
      is_private: false
    }

    case authorized?(user.id, workspace_id) do
      true ->
        case Sway.Rooms.create_or_activate_room(attrs) do
          {:ok, room} ->
            workspace_rooms = Sway.Rooms.list_by_workspace_id(workspace_id)
            all = Enum.map(workspace_rooms, fn room -> room_broadcastable(room) end)

            broadcast(socket, "rooms:create", %{all: all, created: room_broadcastable(room)})
            {:reply, {:ok, %{room: room_broadcastable(room), workspace_rooms: all}}, socket}

          {:error, changeset} ->
            errors = Enum.map(changeset.errors, fn err -> error_broadcastable(err) end)
            {:reply, {:error, errors}, socket}
        end

      false ->
        {:reply, {:error, "No access to specified org"}, socket}
    end
  end

  def handle_in(
        "rooms:create_private",
        %{
          "workspace_id" => encoded_workspace_id,
          "created_by" => encoded_created_by,
          "users" => users
        },
        socket
      ) do
    roomName =
      Enum.join(
        Enum.map(users, fn userId ->
          user = Sway.Accounts.get_user!(SwayWeb.Hashing.decode_user(userId))
          user.name
        end),
        ", "
      )

    workspace_id = SwayWeb.Hashing.decode_workspace(encoded_workspace_id)
    created_by = SwayWeb.Hashing.decode_user(encoded_created_by)

    attrs = %{
      name: roomName,
      workspace_id: workspace_id,
      user_id: created_by,
      is_private: true
    }

    user_ids = Enum.map(users, &SwayWeb.Hashing.decode_user/1)

    room =
      case Sway.Rooms.get_private_room_by_user_ids(workspace_id, user_ids) do
        room ->
          broadcast(socket, "rooms:update", room_broadcastable(room))

        nil ->
          case Sway.Rooms.create_private_room_with_members(
                 attrs,
                 user_ids
               ) do
            {:ok, room} ->
              broadcast(socket, "rooms:update", room_broadcastable(room))

            {:error, _changes_so_far, failed_operation, _changes} ->
              {:reply, {:error, "Failed to create private room: #{inspect(failed_operation)}"},
               socket}
          end
      end
  end

  def handle_in("rooms:rename", %{"id" => encoded_room_id, "name" => name}, socket) do
    user = Sway.Accounts.get_user!(socket.assigns.user)
    room = Sway.Rooms.get_room!(SwayWeb.Hashing.decode_room(encoded_room_id))

    case authorized?(user.id, room.workspace_id) do
      true ->
        case Sway.Rooms.update_room(room, %{name: name}) do
          {:ok, room} ->
            broadcast(socket, "rooms:update", room_broadcastable(room))
            {:reply, {:ok, %{room: room_broadcastable(room)}}, socket}

          {:error, changeset} ->
            errors = Enum.map(changeset.errors, fn err -> error_broadcastable(err) end)
            {:reply, {:error, errors}, socket}
        end

      false ->
        {:reply, {:error, "Wrong org"}, socket}
    end
  end

  def handle_in("rooms:delete", %{"id" => encoded_room_id}, socket) do
    user = Sway.Accounts.get_user!(socket.assigns.user)
    room = Sway.Rooms.get_room!(SwayWeb.Hashing.decode_room(encoded_room_id))

    case authorized?(user.id, room.workspace_id) do
      true ->
        case Sway.Rooms.update_room(room, %{is_active: false}) do
          {:ok, room} ->
            broadcast(socket, "rooms:update", room_broadcastable(room))
            workspace_rooms = Sway.Rooms.list_by_workspace_id(room.workspace_id)

            {:reply,
             {:ok,
              %{
                room: room_broadcastable(room),
                workspace_rooms:
                  Enum.map(workspace_rooms, fn room -> room_broadcastable(room) end)
              }}, socket}

          {:error, changeset} ->
            errors = Enum.map(changeset.errors, fn err -> error_broadcastable(err) end)
            {:reply, {:error, errors}, socket}
        end

      false ->
        {:reply, {:error, "Wrong org"}, socket}
    end
  end

  def handle_in(
        "user:status",
        %{"timezone" => timezone, "workspace_id" => encoded_workspace_id},
        socket
      ) do
    status =
      Sway.Statuses.get_latest_status(
        socket.assigns.user,
        SwayWeb.Hashing.decode_workspace(encoded_workspace_id)
      )

    case Sway.Statuses.update_status(status, %{timezone: timezone}) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in(
        "user:status",
        %{"emoji" => emoji, "workspace_id" => encoded_workspace_id},
        socket
      ) do
    status =
      Sway.Statuses.get_latest_status(
        socket.assigns.user,
        SwayWeb.Hashing.decode_workspace(encoded_workspace_id)
      )

    case Sway.Statuses.update_status(status, %{emoji: emoji}) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in(
        "user:status",
        %{"message" => message, "workspace_id" => encoded_workspace_id},
        socket
      ) do
    last =
      Sway.Statuses.get_latest_status(
        socket.assigns.user,
        SwayWeb.Hashing.decode_workspace(encoded_workspace_id)
      )

    next = %{
      message: message,
      status: last.status,
      emoji: last.emoji,
      room_id: last.room_id,
      user_id: last.user_id,
      workspace_id: last.workspace_id,
      timezone: last.timezone,
      camera_on: last.camera_on,
      mic_on: last.mic_on,
      speaker_on: last.speaker_on
    }

    if last.message != next.message do
      case Sway.Statuses.create_status(next) do
        {:ok, status} ->
          broadcast(socket, "user:status", status_broadcastable(status))
          {:noreply, socket}

        {:error, reason} ->
          {:error, %{reason: reason}}
      end
    else
      {:noreply, socket}
    end
  end

  def handle_in(
        "user:status",
        %{
          "presence_mode" => presence_mode,
          "room_id" => encoded_room_id,
          "workspace_id" => encoded_workspace_id
        },
        socket
      ) do
    room_id = SwayWeb.Hashing.decode_room(encoded_room_id)
    workspace_id = SwayWeb.Hashing.decode_workspace(encoded_workspace_id)

    case Sway.Statuses.create_status(%{
           status: presence_mode,
           user_id: socket.assigns.user,
           room_id: room_id,
           workspace_id: workspace_id
         }) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in(
        "user:status",
        %{
          "mode" => mode,
          "camera_on" => camera_on,
          "mic_on" => mic_on,
          "speaker_on" => speaker_on,
          "room_id" => encoded_room_id,
          "workspace_id" => encoded_workspace_id
        },
        socket
      ) do
    status =
      Sway.Statuses.get_latest_status(
        socket.assigns.user,
        SwayWeb.Hashing.decode_workspace(encoded_workspace_id)
      )

    case Sway.Statuses.update_status(status, %{
           status: mode,
           camera_on: camera_on,
           mic_on: mic_on,
           speaker_on: speaker_on,
           room_id: SwayWeb.Hashing.decode_room(encoded_room_id)
         }) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (chat:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(user_id, workspace_id) do
    membership = Sway.Workspaces.get_membership_by_workspace(user_id, workspace_id)
    membership != nil
  end

  defp list_online_users_by_rooms(socket, workspace_id) do
    UserPresence.list(socket)
    |> Enum.map(fn {_, value} -> SwayWeb.Hashing.decode_user(hd(value[:metas])[:user_id]) end)
    |> Enum.map(fn user_id ->
      Sway.Statuses.get_latest_status(user_id, workspace_id)
    end)

    # |> Enum.group_by(&(&1["room_id"]), &(&1))
  end

  def room_broadcastable(room) do
    SwayWeb.RoomView.encode(room)
  end

  def user_broadcastable(user) do
    SwayWeb.UserView.encode(user)
  end

  def status_broadcastable(status) do
    SwayWeb.StatusView.encode(status)
  end

  def membership_broadcastable(membership) do
    SwayWeb.MembershipView.encode(membership)
  end

  def error_broadcastable({field, value}) do
    err = elem(value, 0)

    %{
      "field" => field,
      "error" => err
    }
  end
end
