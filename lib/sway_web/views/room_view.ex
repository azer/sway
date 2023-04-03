defmodule SwayWeb.RoomView do
  use SwayWeb, :view
  alias SwayWeb.RoomView
  alias SwayWeb.APIView

  def links(room, acc) do
    acc
    |> APIView.append_user(room.user_id)
    |> APIView.append_workspace(room.workspace_id)
    #|> APIView.append_links(
      #:private_members,
      #Enum.map(Sway.Rooms.list_private_members_by_room_id(room.id), fn pm -> APIView.link(pm) end)
    #)
  end

  def render("index.json", %{rooms: rooms}) do
    %{list: render_many(rooms, RoomView, "room.json")}
  end

   def render("show.json", %{room: room}) do
    %{result: render_one(room, RoomView, "room.json")}
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
