defmodule SwayWeb.RoomController do
  use SwayWeb, :controller

  alias Sway.Rooms

  action_fallback SwayWeb.FallbackController

  def index(conn, %{"workspace_id" => %{ "eq" => encoded_workspace_id }, "is_private" => %{"true" => _} }) do
    current_user = Guardian.Plug.current_resource(conn)
    workspace_id = SwayWeb.Hashing.decode_workspace(encoded_workspace_id)
    rooms = Rooms.list_private_rooms_by_user_id(workspace_id, current_user.id)
    render(conn, "index.json", rooms: rooms)
  end

  def show(conn, %{ "id" => encoded_id }) do
    id = SwayWeb.Hashing.decode_room(encoded_id)
    room = Rooms.get_room!(id)
    current_user = Guardian.Plug.current_resource(conn)

    case Sway.Workspaces.get_membership_by_workspace(current_user.id, room.workspace_id) do
      %Sway.Workspaces.Membership{} = _membership ->
	render(conn, "show.json", room: room)
      nil ->
	conn
	|> put_status(:not_found)
	|> json(%{error: "Not found"})
    end
  end

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
