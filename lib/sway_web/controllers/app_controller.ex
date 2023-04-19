defmodule SwayWeb.AppController do
  use SwayWeb, :controller
  alias Sway.Guardian

  def index(conn, params) do
    user_id = conn.assigns.current_user.id

    [workspace, membership] = Sway.Workspaces.get_membership_and_workspace(user_id, params["workspace"])

    if workspace do
      [rooms, status, privateRooms] = fetchRoomData(workspace.id, user_id)
       {:ok, jwt, _claims} = Guardian.encode_and_sign(conn.assigns.current_user, %{})

       render(conn, "app_home.html",
      jwt: jwt,
      user: SwayWeb.UserView.encode(conn.assigns.current_user),
      membership: SwayWeb.MembershipView.encode(membership),
      workspace: SwayWeb.WorkspaceView.encode(workspace),
      status: SwayWeb.StatusView.encode(status),
      rooms: Enum.map(rooms, fn r-> SwayWeb.RoomView.encode(r) end),
      private_rooms: Enum.map(privateRooms, fn r -> SwayWeb.RoomView.encode(r) end),
      focused_room_id: SwayWeb.Hashing.encode_room(status.room_id),
      body_class: "app",
       )
    else
      conn
       |> put_status(:not_found)
       |> json(%{error: "Not found"})
    end

  end

  def room(conn, %{ "workspace" => workspace, "room_slug" => room_slug }) do
    user_id = conn.assigns.current_user.id

    [workspace, membership] = Sway.Workspaces.get_membership_and_workspace(user_id, workspace)
    [rooms, status, private_rooms] = fetchRoomData(workspace.id, user_id)

     {:ok, jwt, _claims} = Guardian.encode_and_sign(conn.assigns.current_user, %{})

    focused_room = Enum.find(rooms, fn el ->
      el.slug == room_slug
    end)

    # FIXME:
    # Change the room
    render(conn, "app_home.html",
      user: SwayWeb.UserView.encode(conn.assigns.current_user),
      membership: SwayWeb.MembershipView.encode(membership),
      workspace: SwayWeb.WorkspaceView.encode(workspace),
      status: SwayWeb.StatusView.encode(status),
      rooms: Enum.map(rooms, fn r-> SwayWeb.RoomView.encode(r) end),
      private_rooms: Enum.map(private_rooms, fn r -> SwayWeb.RoomView.encode(r) end),
      focused_room_id: SwayWeb.Hashing.encode_room(focused_room.id),
      body_class: "app",
      jwt: jwt,
      fake_state: false,
    )
  end

  def private_room(conn, %{ "workspace" => workspace, "room_id" => encoded_room_id, "room_slug" => room_slug }) do
    user_id = conn.assigns.current_user.id

    [workspace, membership] = Sway.Workspaces.get_membership_and_workspace(user_id, workspace)
    [rooms, status, private_rooms] = fetchRoomData(workspace.id, user_id)
    room_id = SwayWeb.Hashing.decode_room(encoded_room_id)

     {:ok, jwt, _claims} = Guardian.encode_and_sign(conn.assigns.current_user, %{})

    focused_room = Enum.find(private_rooms, fn el ->
      el.slug == room_slug && el.id == room_id
    end)

    # FIXME:
    # Change the room
    render(conn, "app_home.html",
      user: SwayWeb.UserView.encode(conn.assigns.current_user),
      membership: SwayWeb.MembershipView.encode(membership),
      workspace: SwayWeb.WorkspaceView.encode(workspace),
      status: SwayWeb.StatusView.encode(status),
      rooms: Enum.map(rooms, fn r-> SwayWeb.RoomView.encode(r) end),
      private_rooms: Enum.map(private_rooms, fn r -> SwayWeb.RoomView.encode(r) end),
      focused_room_id: SwayWeb.Hashing.encode_room(focused_room.id),
      body_class: "app",
      jwt: jwt,
      fake_state: false,
    )
  end

  defp fetchRoomData(workspace_id, user_id) do
    rooms = Sway.Rooms.list_by_workspace_id(workspace_id)
    status = Sway.Statuses.get_latest_status(user_id, workspace_id)
    private_rooms = Sway.Rooms.list_private_rooms_by_user_id(workspace_id, user_id)
    [rooms, status, private_rooms]
  end
end
