defmodule BafaWeb.ChatChannel do
  use BafaWeb, :channel

  alias BafaWeb.UserPresence

  @impl true
  def join("chat:lobby", payload, socket) do
    if authorized?(payload) do
      send(self(), :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  def handle_info(:after_join, socket) do
    user = Bafa.Accounts.get_user!(socket.assigns[:user])

    {:ok, _} =
      UserPresence.track(socket, "user:#{user.id}", %{
        user_id: user.id,
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", UserPresence.list(socket))

    {:noreply, socket}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  @spec handle_in(<<_::32, _::_*8>>, any, any) ::
          {:noreply, Phoenix.Socket.t()} | {:reply, {:ok, any}, any}
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (chat:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
