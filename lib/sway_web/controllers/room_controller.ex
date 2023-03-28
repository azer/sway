defmodule SwayWeb.RoomController do
  use SwayWeb, :controller

  alias Sway.Rooms

  action_fallback SwayWeb.FallbackController

  def create(conn, %{"private_room" => room_params }) do
    workspace_id = SwayWeb.Hashing.decode_workspace(room_params["workspace_id"])
    current_user = Guardian.Plug.current_resource(conn)

    created_by = current_user.id

    attrs = %{
      workspace_id: workspace_id,
      user_id: created_by,
      is_private: true
    }

    user_ids = Enum.map(room_params["users"], &SwayWeb.Hashing.decode_user/1)

    case Rooms.get_private_room_by_user_ids(workspace_id, user_ids) do
      %Sway.Rooms.Room{} = room ->
        render(conn, "show.json", room: room)

      nil ->
        {:ok, results} =
          Rooms.create_private_room_with_members(
            attrs,
            user_ids
          )

        render(conn, "show.json", %{ room: results.room })
    end
  end
end
