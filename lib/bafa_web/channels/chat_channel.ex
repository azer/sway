defmodule BafaWeb.ChatChannel do
  use BafaWeb, :channel

  alias BafaWeb.UserPresence

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
    user = Bafa.Accounts.get_user!(socket.assigns[:user])

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
    user = Bafa.Accounts.get_user!(String.to_integer(id))

    resp = %{
      "id" => id,
      "name" => user.name,
      "email" => user.email,
      "org_id" => user.org_id,
      "profile_photo_url" => user.profile_photo_url
    }

    {:reply, {:ok, resp}, socket}
  end

  def handle_in("rooms:join", %{"id" => id}, socket) do
    broadcast(socket, "rooms:join", %{"id" => id, "user_id" => socket.assigns.user})

    {:ok, _} =
      UserPresence.update(socket, "users:#{socket.assigns.user}", %{
        user_id: socket.assigns.user,
        online_at: inspect(System.system_time(:second)),
        room_id: id
      })

    {:noreply, socket}
  end

  def handle_in("user:status", %{"presence_mode" => presence_mode}, socket) do
    broadcast(socket, "user:status", %{
      "presence_mode" => presence_mode,
      "user_id" => socket.assigns.user
    })

    IO.puts(presence_mode)

    case Bafa.Statuses.create_status(%{status: presence_mode, user_id: socket.assigns.user}) do
      {:ok, status} -> IO.inspect(status)
      {:error, reason} -> IO.puts(reason)
    end

    {:noreply, socket}
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
    user = Bafa.Accounts.get_user!(userId)
    user.org_id == orgId
  end
end
