defmodule SwayWeb.RoomView do
  use SwayWeb, :view
  alias SwayWeb.RoomView
  alias SwayWeb.APIView

  def links(resp, room) do
    resp
    |> APIView.add_user(room.user_id)
    |> APIView.add_workspace(room.workspace_id)
    |> APIView.add_links(
      :room_members,
      Enum.map(Sway.Rooms.list_room_members_by_room_id(room.id), fn pm -> APIView.link(pm, SwayWeb.RoomMemberView) end)
    )
  end

  def render("index.json", %{rooms: rooms}) do
    %{
      list: render_many(rooms, RoomView, "room.json"),
      links: APIView.links(:rooms, RoomView, rooms)
    }
  end

  def render("show.json", %{room: room}) do
    IO.inspect(room)
    %{
      result: render_one(room, RoomView, "room.json"),
      links: APIView.links(:rooms, RoomView, room)
    }
  end

  def render("room.json", %{room: room}) do
    APIView.row(encode(room), :rooms)
  end

  def encode(room) do
    %{
      id: SwayWeb.Hashing.encode_room(room.id),
      name: room.name,
      slug: room.slug,
      is_default: room.is_default,
      is_active: room.is_active,
      is_private: room.is_private,
      workspace_id: SwayWeb.Hashing.encode_workspace(room.workspace_id),
      user_id: SwayWeb.Hashing.encode_user(room.user_id),
      inserted_at: room.inserted_at
    }
  end
end
