defmodule SwayWeb.WorkspaceChannel do
  use SwayWeb, :channel

  alias SwayWeb.UserPresence

  @impl true
  def join("workspace:" <> workspace_id, _payload, socket) do
    if authorized?(socket.assigns.user, String.to_integer(workspace_id)) do
      send(self(), :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    user = Sway.Accounts.get_user!(socket.assigns[:user])

    {:ok, _} =
      UserPresence.track(socket, "users:#{user.id}", %{
            user_id: user.id,
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

  def handle_in("entities:fetch", %{"id" => id, "entity" => entity}, socket) do
    user = Sway.Accounts.get_user!(String.to_integer(id))
    {:reply, {:ok, user_broadcastable(user)}, socket}
  end

  def handle_in("workspace:list_online_users", %{ "workspace_id" => workspace_id }, socket) do
    users_by_rooms = list_online_users_by_rooms(socket, workspace_id)
    {:reply, {:ok, users_by_rooms}, socket}
  end

  def handle_in("workspace:list_workspace_memberships", %{ "workspace_id" => workspace_id }, socket) do
    memberships = Sway.Workspaces.list_memberships_by_workspace(workspace_id)
    {:reply, {:ok, Enum.map(memberships, fn membership -> membership_broadcastable(membership) end)}, socket}
  end

  def handle_in("rooms:join", %{"id" => id, "workspace_id" => workspace_id}, socket) do
    broadcast(socket, "rooms:join", %{"id" => id, "user_id" => socket.assigns.user})

    {:ok, _} =
      UserPresence.update(socket, "users:#{socket.assigns.user}", %{
        user_id: socket.assigns.user,
        online_at: inspect(System.system_time(:second)),
        room_id: id,
	workspace_id: workspace_id
      })

    status = Sway.Statuses.get_latest_status(socket.assigns.user, workspace_id)

    case Sway.Statuses.update_status(status, %{room_id: id}) do
      {:ok, status} ->
        #broadcast(socket, "user:status", status_broadcastable(status))
	broadcast(socket, "workspace:sync_users", list_online_users_by_rooms(socket, workspace_id))

        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("rooms:create", %{"name" => name, "workspace_id" => workspace_id}, socket) do
    user = Sway.Accounts.get_user!(socket.assigns.user)

    attrs = %{
               name: name,
               slug: Slug.slugify(name),
               workspace_id: workspace_id,
               user_id: socket.assigns.user
    }

    case authorized?(user.id, workspace_id) do
      true ->
        case Sway.Rooms.create_or_activate_room(attrs) do
          {:ok, room} ->
	    workspace_rooms = Sway.Rooms.list_by_workspace_id(workspace_id)
	    all = Enum.map(workspace_rooms, fn room -> room_broadcastable(room) end)

	    broadcast(socket, "rooms:create", %{ "all": all, "created": room_broadcastable(room) })
	    {:reply, {:ok, %{ "room": room_broadcastable(room), "workspace_rooms": all }}, socket}

          {:error, changeset} ->
	    errors = Enum.map(changeset.errors, fn err -> error_broadcastable(err) end)
            {:reply, {:error, errors}, socket}
        end

      false ->
        {:reply, {:error, "No access to specified org"}, socket}
    end
  end

  def handle_in("rooms:rename", %{ "id" => room_id, "name" => name }, socket) do
    user = Sway.Accounts.get_user!(socket.assigns.user)
    room = Sway.Rooms.get_room!(room_id)
    case authorized?(user.id, room.workspace_id) do
      true ->
	case Sway.Rooms.update_room(room, %{ name: name }) do
          {:ok, room} ->
	    broadcast(socket, "rooms:update", room_broadcastable(room))
	    {:reply, {:ok, %{ "room": room_broadcastable(room) }}, socket}
          {:error, changeset} ->
	    errors = Enum.map(changeset.errors, fn err -> error_broadcastable(err) end)
            {:reply, {:error, errors}, socket}
        end
      false ->
	{:reply, {:error, "Wrong org"}, socket}
    end
  end

  def handle_in("rooms:delete", %{ "id" => room_id }, socket) do
    user = Sway.Accounts.get_user!(socket.assigns.user)
    room = Sway.Rooms.get_room!(room_id)
    case authorized?(user.id, room.workspace_id) do
      true ->
	case Sway.Rooms.update_room(room, %{ is_active: false }) do
          {:ok, room} ->
	    broadcast(socket, "rooms:update", room_broadcastable(room))
	    workspace_rooms = Sway.Rooms.list_by_workspace_id(room.workspace_id)
	    {:reply, {:ok, %{ "room": room_broadcastable(room), "workspace_rooms": Enum.map(workspace_rooms, fn room -> room_broadcastable(room) end) }}, socket}
          {:error, changeset} ->
	    errors = Enum.map(changeset.errors, fn err -> error_broadcastable(err) end)
            {:reply, {:error, errors}, socket}
        end
      false ->
	{:reply, {:error, "Wrong org"}, socket}
    end
  end

  def handle_in("user:status", %{"timezone" => timezone, "workspace_id" => workspace_id}, socket) do
    status = Sway.Statuses.get_latest_status(socket.assigns.user, workspace_id)
    case Sway.Statuses.update_status(status, %{ timezone: timezone }) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}
      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("user:status", %{"emoji" => emoji, "workspace_id" => workspace_id}, socket) do
    status = Sway.Statuses.get_latest_status(socket.assigns.user, workspace_id)
    case Sway.Statuses.update_status(status, %{ emoji: emoji }) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}
      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("user:status", %{"message" => message, "workspace_id" => workspace_id}, socket) do
    status = Sway.Statuses.get_latest_status(socket.assigns.user, workspace_id)
    case Sway.Statuses.update_status(status, %{ message: message }) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}
      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("user:status", %{"presence_mode" => presence_mode, "room_id" => room_id, "workspace_id" => workspace_id }, socket) do
    {room_id_int, ""} = Integer.parse(room_id)
    {workspace_id_int, ""} = Integer.parse(workspace_id)

    case Sway.Statuses.create_status(%{
           status: presence_mode,
           user_id: socket.assigns.user,
           room_id: room_id_int,
	   workspace_id: workspace_id_int
         }) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("user:status", %{"mode" => mode, "camera_on" => camera_on, "mic_on" => mic_on, "speaker_on" => speaker_on, "room_id" => room_id,  "workspace_id" => workspace_id}, socket) do
    status = Sway.Statuses.get_latest_status(socket.assigns.user, workspace_id)

    case Sway.Statuses.update_status(status, %{ status: mode, camera_on: camera_on, mic_on: mic_on, speaker_on: speaker_on }) do
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
    list = UserPresence.list(socket)
    user_ids = Enum.map(list, fn ({_, value}) -> hd(value[:metas])[:user_id] end)
    statuses = Enum.map(user_ids, fn user_id -> status_broadcastable(Sway.Statuses.get_latest_status(user_id, workspace_id)) end)

    Enum.reduce(statuses, %{}, fn %{"room_id" => room_id, "user_id" => user_id}, acc ->
      case Map.get(acc, room_id) do
	nil -> Map.put(acc, room_id, ["#{user_id}"])
	users -> Map.put(acc, room_id, users ++ ["#{user_id}"])
      end
    end)
  end

  def room_broadcastable(room) do
    %{
      "id" => room.id,
      "name" => room.name,
      "slug" => room.slug,
      "is_default" => room.is_default,
      "is_active" => room.is_active,
      "user_id" => room.user_id,
      "inserted_at" => room.inserted_at
    }
  end

  def user_broadcastable(user) do
    %{
      "id" => user.id,
      "name" => user.name,
      "email" => user.email,
      "profile_photo_url" => user.profile_photo_url
    }
  end

  def status_broadcastable(status) do
    %{
      "id" => status.id,
      "room_id" => status.room_id,
      "user_id" => status.user_id,
      "message" => status.message,
      "camera_on" => status.camera_on,
      "mic_on" => status.mic_on,
      "speaker_on" => status.speaker_on,
      "status" => status.status,
      "emoji" => status.emoji,
      "workspace_id" => status.workspace_id,
      "inserted_at" => status.inserted_at
    }
  end

  def membership_broadcastable(membership) do
    %{
      "id" => membership.id,
      "user_id" => membership.user_id,
      "workspace_id" => membership.workspace_id,
      "is_admin" => membership.is_admin,
      "inserted_at" => membership.inserted_at
    }
  end

  def error_broadcastable({ field, value }) do
    err = elem(value, 0)
    %{
      "field" => field,
      "error" => err
    }
  end
end
