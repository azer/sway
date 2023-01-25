defmodule SwayWeb.ChatChannel do
  use SwayWeb, :channel

  alias SwayWeb.UserPresence

  @impl true
  def join("org:" <> org_id, payload, socket) do
    if authorized?(socket.assigns.user, String.to_integer(org_id)) do
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

  def handle_in("rooms:join", %{"id" => id}, socket) do
    broadcast(socket, "rooms:join", %{"id" => id, "user_id" => socket.assigns.user})

    {:ok, _} =
      UserPresence.update(socket, "users:#{socket.assigns.user}", %{
        user_id: socket.assigns.user,
        online_at: inspect(System.system_time(:second)),
        room_id: id
      })

    status = Sway.Statuses.get_latest_status(socket.assigns.user)

    case Sway.Statuses.update_status(status, %{room_id: id}) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("rooms:create", %{"name" => name, "org_id" => org_id}, socket) do
    user = Sway.Accounts.get_user!(socket.assigns.user)

    attrs = %{
               name: name,
               slug: Slug.slugify(name),
               org_id: org_id,
               user_id: socket.assigns.user
    }

    case user.org_id == org_id do
      true ->
        case Sway.Rooms.create_or_activate_room(attrs) do
          {:ok, room} ->
	    org_rooms = Sway.Rooms.list_org_rooms(user.org_id, user.id)
	    all = Enum.map(org_rooms, fn room -> room_broadcastable(room) end)

	    broadcast(socket, "rooms:create", %{ "all": all, "created": room_broadcastable(room) })
	    {:reply, {:ok, %{ "room": room_broadcastable(room), "org_rooms": all }}, socket}

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
    case room.org_id == user.org_id do
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
    case room.org_id == user.org_id do
      true ->
	case Sway.Rooms.update_room(room, %{ is_active: false }) do
          {:ok, room} ->
	    broadcast(socket, "rooms:update", room_broadcastable(room))
	    org_rooms = Sway.Rooms.list_org_rooms(user.org_id, user.id)
	    {:reply, {:ok, %{ "room": room_broadcastable(room), "org_rooms": Enum.map(org_rooms, fn room -> room_broadcastable(room) end) }}, socket}
          {:error, changeset} ->
	    errors = Enum.map(changeset.errors, fn err -> error_broadcastable(err) end)
            {:reply, {:error, errors}, socket}
        end
      false ->
	{:reply, {:error, "Wrong org"}, socket}
    end
  end

  def handle_in("user:status", %{"presence_mode" => presence_mode, "room_id" => room_id}, socket) do
    {room_id_int, ""} = Integer.parse(room_id)

    case Sway.Statuses.create_status(%{
           status: presence_mode,
           user_id: socket.assigns.user,
           room_id: room_id_int
         }) do
      {:ok, status} ->
        broadcast(socket, "user:status", status_broadcastable(status))
        {:noreply, socket}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  def handle_in("user:status", %{"is_active" => is_active}, socket) do
    status = Sway.Statuses.get_latest_status(socket.assigns.user)

    case Sway.Statuses.update_status(status, %{is_active: is_active}) do
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
  defp authorized?(userId, orgId) do
    user = Sway.Accounts.get_user!(userId)
    user.org_id == orgId
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
      "org_id" => user.org_id,
      "profile_photo_url" => user.profile_photo_url
    }
  end

  def status_broadcastable(status) do
    %{
      "id" => status.id,
      "room_id" => status.room_id,
      "user_id" => status.user_id,
      "message" => status.message,
      "is_active" => status.is_active,
      "status" => status.status,
      "inserted_at" => status.inserted_at
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
