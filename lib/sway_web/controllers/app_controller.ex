defmodule SwayWeb.AppController do
  use SwayWeb, :controller

  def index(conn, _params) do
    IO.puts "app controller"

    user_id = conn.assigns.current_user.id
    org_id = conn.assigns.current_user.org_id
    [org, rooms, status] = fetchRoomData(org_id, user_id)

    selected_room_id = hd(rooms).id

    render(conn, "index.html",
      user: conn.assigns.current_user,
      org: org,
      status: status,
      rooms: rooms,
      selected_room_id: selected_room_id
    )
  end

  def room(conn, %{ "slug" => slug}) do
    user_id = conn.assigns.current_user.id
    org_id = conn.assigns.current_user.org_id

    [org, rooms, status] = fetchRoomData(org_id, user_id)

    room = Enum.find(rooms, fn el ->
      el.slug == slug
    end)

    render(conn, "index.html",
      user: conn.assigns.current_user,
      org: org,
      status: status,
      rooms: rooms,
      selected_room_id: room.id
    )
  end

  defp fetchRoomData(org_id, user_id) do
     [org, allRooms] =
      if org_id != nil do
        org = Sway.Accounts.get_org!(org_id)
        rooms = Sway.Rooms.list_org_rooms(org_id, user_id)

        [org, rooms]
      else
        [nil, []]
      end

     status = Sway.Statuses.get_latest_status(user_id)

     [org, allRooms, status]
  end
end
