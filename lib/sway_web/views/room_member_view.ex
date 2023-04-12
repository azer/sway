defmodule SwayWeb.RoomMemberView do
  use SwayWeb, :view
  alias SwayWeb.APIView
  alias SwayWeb.RoomMemberView

  def links(view, member) do
    view
    |> APIView.add_user(member.user_id)
    |> APIView.add_room(member.room_id)
  end

  def render("index.json", %{room_members: members}) do
    %{
      list: render_many(members, RoomMemberView, "room_member.json"),
      links: APIView.render_links(APIView.many_links(members, %{}, fn member, acc -> links(member, acc) end))
    }
  end

  def render("show.json", %{room_member: member}) do
    %{result: render_one(member, RoomMemberView, "room_member.json")}
  end

  def render("room_member.json", %{room_member: member}) do
    APIView.row(encode(member), :room_members)
  end

  def encode(member) do
    %{
      id: SwayWeb.Hashing.encode_room_member(member.id),
      room_id: SwayWeb.Hashing.encode_room(member.room_id),
      user_id: SwayWeb.Hashing.encode_user(member.user_id),
      inserted_at: member.inserted_at
    }
  end
end
