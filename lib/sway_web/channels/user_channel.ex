defmodule SwayWeb.UserChannel do
  use Phoenix.Channel

  def join("user:" <> user_id, _params, socket) do
    # Perform any authentication and authorization here
    # Make sure to replace "your_app" with the name of your app
    {:ok, assign(socket, :user_id, String.to_integer(user_id))}
  end

end
