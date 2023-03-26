defmodule SwayWeb.StatusController do
  use SwayWeb, :controller

  alias Sway.Statuses
  alias Sway.Statuses.Status

  def list_updates_by_user(conn, %{ "user_id" => encoded_user_id }) do
    user_id = SwayWeb.Hashing.decode_user(encoded_user_id)
    render(conn, "index.json", statuses: Statuses.get_updates_by_user(user_id))
  end

end
