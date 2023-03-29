defmodule SwayWeb.RoomMemberController do
  use SwayWeb, :controller

  action_fallback SwayWeb.FallbackController

  def index(conn, %{ "room_id" => encoded_room_id }) do
    room_id = SwayWeb.Hashing.decode_room(encoded_room_id)
    current_user = Guardian.Plug.current_resource(conn)
    members = Sway.Rooms.list_room_members_by_room_id(room_id)

    is_member = Enum.any?(members, fn member ->
      member.user_id == current_user.id
    end)

    if is_member do
      render(conn, "index.json", room_members: members)
    else
       conn
       |> put_status(:forbidden)
       |> json(%{error: "Forbidden"})
    end
  end
end
